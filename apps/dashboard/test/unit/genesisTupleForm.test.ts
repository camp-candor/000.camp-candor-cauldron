import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { evaluateGenesisTupleMaster as validateGenesisTuple } from '../../src/lib/validation/genesisRules'
import { type GenesisTuplePayload } from '../../src/lib/validation/genesisSchema'

describe('[Task 2.3] Client-Side Narrative Tuple Form Island Gauntlet', () => {
    const componentPath = path.resolve(
        __dirname,
        '../../src/components/islands/GenesisTupleForm.tsx',
    )
    const schemaPath = path.resolve(
        __dirname,
        '../../src/lib/validation/genesisSchema.ts',
    )

    it('asserts physical existence of GenesisTupleForm.tsx and genesisSchema.ts', () => {
        expect(fs.existsSync(componentPath)).toBe(true)
        expect(fs.existsSync(schemaPath)).toBe(true)
    })

    it('asserts pure 7-bit clean ASCII compliance across island and schema files', () => {
        const compContent = fs.readFileSync(componentPath, 'utf8')
        const schemaContent = fs.readFileSync(schemaPath, 'utf8')

        const asciiRegex = /^[\x00-\x7F]*$/
        expect(asciiRegex.test(compContent)).toBe(true)
        expect(asciiRegex.test(schemaContent)).toBe(true)
    })

    it('accepts a valid canonical narrative 4-tuple', () => {
        const validPayload: GenesisTuplePayload = {
            series_slug: 'wiregrass-basin',
            franchise_title: 'Wiregrass Basin',
            genre_tag: 'SOUTHERN_GOTHIC_INDUSTRIAL',
            central_irony: 'They build water purifiers but perish of thirst.',
            state_space: {
                scarcity_index_bps: 8000,
                paranoia_baseline_bps: 5000,
                scrap_max_grams: 50,
                weight_max_grams: 5000,
            },
            action_vocabulary: ['CONCEAL', 'SIPHON', 'DEFLECT'],
            invariants: {
                max_farce_ratio_bps: 1200,
                min_escalation_depth: 2,
                global_acoustic_floor_cdb: 1500,
                vo_ducking_db: -14,
            },
            medium_projections: {
                tts_port: 8000,
                comfy_port: 8188,
                target_fps: 24,
                lora_trigger_tokens: ['wiregrass'],
            },
        }

        const res = validateGenesisTuple(validPayload)
        expect(res.valid).toBe(true)
        expect(Object.keys(res.errors).length).toBe(0)
    })

    it('rejects malformed uppercase or symbol-laden series slugs', () => {
        const invalidSlugPayload: Partial<GenesisTuplePayload> = {
            series_slug: 'Wiregrass_Basin!',
            franchise_title: 'Test',
            genre_tag: 'LOW_FANTASY_FARCE',
            central_irony: 'A long enough irony statement',
            state_space: {
                scarcity_index_bps: 1000,
                paranoia_baseline_bps: 1000,
                scrap_max_grams: 50,
                weight_max_grams: 500,
            },
            action_vocabulary: ['LIMP'],
            invariants: {
                max_farce_ratio_bps: 1000,
                global_acoustic_floor_cdb: 1000,
                vo_ducking_db: -10,
            },
            medium_projections: {
                tts_port: 8000,
                comfy_port: 8188,
                target_fps: 24,
                lora_trigger_tokens: [],
            },
        }

        const res = validateGenesisTuple(invalidSlugPayload)
        expect(res.valid).toBe(false)
        expect(res.errors.series_slug).toBeDefined()
    })

    it('rejects floating point decimals in integer basis point fields', () => {
        const floatPayload: Partial<GenesisTuplePayload> = {
            series_slug: 'test-slug',
            franchise_title: 'Test',
            genre_tag: 'LOW_FANTASY_FARCE',
            central_irony: 'A valid central irony statement',
            state_space: {
                scarcity_index_bps: 850.5,
                paranoia_baseline_bps: 1000,
                scrap_max_grams: 50,
                weight_max_grams: 500,
            },
            action_vocabulary: ['LIMP'],
            invariants: {
                max_farce_ratio_bps: 1000,
                global_acoustic_floor_cdb: 1000,
                vo_ducking_db: -10,
            },
            medium_projections: {
                tts_port: 8000,
                comfy_port: 8188,
                target_fps: 24,
                lora_trigger_tokens: [],
            },
        }

        const res = validateGenesisTuple(floatPayload)
        expect(res.valid).toBe(false)
        expect(res.errors.scarcity_index_bps).toBeDefined()
    })

    it('rejects farce ratio ceilings exceeding 1500 bps (15%)', () => {
        const excessiveFarcePayload: Partial<GenesisTuplePayload> = {
            series_slug: 'test-slug',
            franchise_title: 'Test',
            genre_tag: 'LOW_FANTASY_FARCE',
            central_irony: 'A valid central irony statement',
            state_space: {
                scarcity_index_bps: 1000,
                paranoia_baseline_bps: 1000,
                scrap_max_grams: 50,
                weight_max_grams: 500,
            },
            action_vocabulary: ['LIMP'],
            invariants: {
                max_farce_ratio_bps: 1501,
                global_acoustic_floor_cdb: 1000,
                vo_ducking_db: -10,
            },
            medium_projections: {
                tts_port: 8000,
                comfy_port: 8188,
                target_fps: 24,
                lora_trigger_tokens: [],
            },
        }

        const res = validateGenesisTuple(excessiveFarcePayload)
        expect(res.valid).toBe(false)
        expect(res.errors.max_farce_ratio_bps).toBeDefined()
    })
})
