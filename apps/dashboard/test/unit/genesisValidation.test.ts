import { describe, it, expect } from 'vitest'
import {
    GenesisTupleSchema,
    canonicalizeJsonString,
    type GenesisTuplePayload,
} from '../../src/lib/validation/genesisSchema'

const VALID_SAMPLE: GenesisTuplePayload = {
    series_slug: 'under-the-floorboards',
    state_space: {
        active_characters: ['char-bog', 'char-spleen'],
        primary_locations: ['loc-warm-pipe'],
        initial_items: ['item-founder-token'],
    },
    action_vocabulary: {
        kinetic_verbs: ['SEIZE', 'CONCEAL', 'BARTER'],
        allow_unarmed_combat: true,
    },
    invariant_laws: {
        scarcity_index_bps: 8500,
        paranoia_baseline_bps: 4200,
        max_farce_ratio_bps: 1200,
        somatic_death_permanent: true,
        two_handed_equip_cap: true,
    },
    medium_projections: {
        render_aspect_ratio: '16:9',
        master_fps: 24,
        target_medium: 'SCREENPLAY_AST',
    },
}

describe('Genesis Tuple Zod Validation Battery', () => {
    it('accepts compliant Universal Narrative 4-Tuple configurations', () => {
        const result = GenesisTupleSchema.safeParse(VALID_SAMPLE)
        expect(result.success).toBe(true)
    })

    it('rejects floating-point decimals with FLOAT_PROHIBITED', () => {
        const invalid = {
            ...VALID_SAMPLE,
            invariant_laws: {
                ...VALID_SAMPLE.invariant_laws,
                scarcity_index_bps: 85.5,
            },
        }
        const result = GenesisTupleSchema.safeParse(invalid)
        expect(result.success).toBe(false)
    })

    it('rejects farce ratios exceeding the 1500 bps boundary', () => {
        const invalid = {
            ...VALID_SAMPLE,
            invariant_laws: {
                ...VALID_SAMPLE.invariant_laws,
                max_farce_ratio_bps: 1501,
            },
        }
        const result = GenesisTupleSchema.safeParse(invalid)
        expect(result.success).toBe(false)
    })

    it('rejects invalid action verb lists with fewer than 3 kinetic verbs', () => {
        const invalid = {
            ...VALID_SAMPLE,
            action_vocabulary: {
                ...VALID_SAMPLE.action_vocabulary,
                kinetic_verbs: ['SEIZE', 'FLEE'],
            },
        }
        const result = GenesisTupleSchema.safeParse(invalid)
        expect(result.success).toBe(false)
    })

    it('canonicalizes JSON payloads deterministically with sorted UTF-16 code units', () => {
        const input = { b: 1, a: 2, c: { y: 10, x: 20 } }
        const serialized = canonicalizeJsonString(input)
        expect(serialized).toBe('{"a":2,"b":1,"c":{"x":20,"y":10}}')
    })
})
