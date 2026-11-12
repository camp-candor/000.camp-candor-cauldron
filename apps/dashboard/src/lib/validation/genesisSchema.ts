/**
 * apps/dashboard/src/lib/validation/genesisSchema.ts
 * Universal Narrative 4-Tuple Validation & Canonicalization Engine.
 * Enforces Gillian Arithmetic Doctrine (integer basis points, no floats)
 * and POSIX identifier formatting.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import { z } from 'zod'

// Regex: POSIX kebab-case identifier (3 to 48 chars)
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Regex: Uppercase ASCII kinetic verbs (e.g., SEIZE, FLEE, STRIKE)
export const KINETIC_VERB_REGEX = /^[A-Z_]{3,24}$/

/**
 * Validates integer basis points (0 to 10,000 bps).
 * Explicitly rejects floating-point values.
 */
export const basisPointSchema = (maxBps: number = 10000) =>
    z
        .number()
        .int({
            message: 'FLOAT_PROHIBITED: Value must be an integer basis point',
        })
        .min(0, { message: 'Value must be non-negative' })
        .max(maxBps, { message: `Value exceeds upper limit of ${maxBps} bps` })

export const StateSpaceSchema = z
    .object({
        active_characters: z
            .array(z.string().regex(SLUG_REGEX))
            .min(1, 'Minimum 1 character required'),
        primary_locations: z
            .array(z.string().regex(SLUG_REGEX))
            .min(1, 'Minimum 1 location required'),
        initial_items: z.array(z.string().regex(SLUG_REGEX)).default([]),
    })
    .strict()

export const ActionVocabularySchema = z
    .object({
        kinetic_verbs: z
            .array(
                z
                    .string()
                    .regex(KINETIC_VERB_REGEX, 'Verbs must be uppercase ASCII'),
            )
            .min(3, 'Minimum 3 kinetic verbs required'),
        allow_unarmed_combat: z.boolean().default(true),
    })
    .strict()

export const InvariantLawsSchema = z
    .object({
        scarcity_index_bps: basisPointSchema(10000),
        paranoia_baseline_bps: basisPointSchema(10000),
        max_farce_ratio_bps: basisPointSchema(1500), // Strict cap at 1500 bps
        somatic_death_permanent: z.boolean().default(true),
        two_handed_equip_cap: z.boolean().default(true),
    })
    .strict()

export const MediumProjectionsSchema = z
    .object({
        render_aspect_ratio: z.enum(['16:9', '9:16', '4:3', '1:1']),
        master_fps: z.number().int().min(12).max(60).default(24),
        target_medium: z.enum([
            'SCREENPLAY_AST',
            'VOCODER_AUDIO',
            'DIFFUSION_PLATE',
        ]),
    })
    .strict()

export const GenesisTupleSchema = z
    .object({
        series_slug: z
            .string()
            .min(3, 'Slug must be at least 3 characters')
            .max(48, 'Slug exceeds 48 characters')
            .regex(SLUG_REGEX, 'Slug must be lower-case POSIX kebab-case'),
        state_space: StateSpaceSchema,
        action_vocabulary: ActionVocabularySchema,
        invariant_laws: InvariantLawsSchema,
        medium_projections: MediumProjectionsSchema,
    })
    .strict()

export type GenesisTuplePayload = z.infer<typeof GenesisTupleSchema>

/**
 * Deterministically sorts object keys lexicographically by UTF-16 code units (RFC 8785).
 */
export function canonicalizeJsonString(value: unknown): string {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value)
    }

    if (Array.isArray(value)) {
        return (
            '[' +
            value.map((item) => canonicalizeJsonString(item)).join(',') +
            ']'
        )
    }

    const keys = Object.keys(value as Record<string, unknown>).sort()
    const pairs = keys.map((key) => {
        const val = (value as Record<string, unknown>)[key]
        return `${JSON.stringify(key)}:${canonicalizeJsonString(val)}`
    })

    return `{${pairs.join(',')}}`
}

export const GENRE_MODALITIES: readonly GenreModality[] = [
    'LOW_FANTASY_FARCE',
    'SOUTHERN_GOTHIC_INDUSTRIAL',
    'HARD_SCIFI_VACUUM',
]

export const LORA_TOKEN_REGEX = /^[a-z0-9_]+$/
