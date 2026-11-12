import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    evaluateSeriesSlugRule,
    evaluateStateSpaceRule,
    evaluateActionVocabularyRule,
    evaluateInvariantLawsRule,
    evaluateMediumProjectionsRule,
    evaluateGenesisTupleMaster,
    canonicalizeTupleJson,
} from '../../src/lib/validation/genesisRules'
import type { GenesisTuplePayload } from '../../src/lib/validation/genesisSchema'

describe('[Task 2.4] Local Non-Compute Genesis Form Validation Logic Gauntlet', () => {
    const schemaPath = path.resolve(
        __dirname,
        '../../src/lib/validation/genesisSchema.ts',
    )
    const rulesPath = path.resolve(
        __dirname,
        '../../src/lib/validation/genesisRules.ts',
    )

    const validReferenceTuple: GenesisTuplePayload = {
        series_slug: 'wiregrass-basin',
        franchise_title: 'Wiregrass Basin',
        genre_tag: 'SOUTHERN_GOTHIC_INDUSTRIAL',
        central_irony:
            'Those who build the water filters die of terminal dehydration.',
        state_space: {
            scarcity_index_bps: 8500,
            paranoia_baseline_bps: 6500,
            scrap_max_grams: 50,
            weight_max_grams: 5000,
        },
        action_vocabulary: [
            'CONCEAL',
            'SIPHON',
            'DEFLECT',
            'EXPEND_LEVERAGE',
            'LIMP',
        ],
        invariants: {
            max_farce_ratio_bps: 1000,
            min_escalation_depth: 2,
            global_acoustic_floor_cdb: 1500,
            vo_ducking_db: -14,
        },
        medium_projections: {
            tts_port: 8000,
            comfy_port: 8188,
            target_fps: 24,
            lora_trigger_tokens: ['wiregrass_style', 'rust_grit'],
        },
    }

    it('asserts physical existence of schema and rules files on disk', () => {
        expect(fs.existsSync(schemaPath)).toBe(true)
        expect(fs.existsSync(rulesPath)).toBe(true)
    })

    it('asserts pure 7-bit clean ASCII compliance across validation files', () => {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8')
        const rulesContent = fs.readFileSync(rulesPath, 'utf8')

        const isCleanAscii = (text: string) => /^[\x00-\x7F]*$/.test(text)
        expect(isCleanAscii(schemaContent)).toBe(true)
        expect(isCleanAscii(rulesContent)).toBe(true)
    })

    it('validates canonical reference tuple with zero rule violations', () => {
        const receipt = evaluateGenesisTupleMaster(validReferenceTuple)
        expect(receipt.valid).toBe(true)
        expect(receipt.violations.length).toBe(0)
        expect(receipt.computeTier).toBe('T0_ZERO_SPEND')
    })

    it('rejects uppercase characters and underscores in series slug', () => {
        const errorsUppercase = evaluateSeriesSlugRule('Wiregrass-Basin')
        expect(
            errorsUppercase.some(
                (e) => e.code === 'SERIES_SLUG_FORMAT_INVALID',
            ),
        ).toBe(true)

        const errorsUnderscore = evaluateSeriesSlugRule('wiregrass_basin')
        expect(
            errorsUnderscore.some(
                (e) => e.code === 'SERIES_SLUG_FORMAT_INVALID',
            ),
        ).toBe(true)

        const errorsConsecutiveHyphens =
            evaluateSeriesSlugRule('wiregrass--basin')
        expect(
            errorsConsecutiveHyphens.some(
                (e) => e.code === 'SERIES_SLUG_FORMAT_INVALID',
            ),
        ).toBe(true)
    })

    it('rejects floating point decimals in state space basis points', () => {
        const floatSpace = {
            scarcity_index_bps: 8500.5,
            paranoia_baseline_bps: 5000,
            scrap_max_grams: 50,
            weight_max_grams: 5000,
        }
        const errors = evaluateStateSpaceRule(floatSpace)
        expect(errors.some((e) => e.code === 'FLOAT_PROHIBITED')).toBe(true)
    })

    it('rejects weight maximum thresholds equal to or less than scrap maximum', () => {
        const invalidWeightSpace = {
            scarcity_index_bps: 8500,
            paranoia_baseline_bps: 5000,
            scrap_max_grams: 50,
            weight_max_grams: 50,
        }
        const errors = evaluateStateSpaceRule(invalidWeightSpace)
        expect(
            errors.some((e) => e.code === 'WEIGHT_MUST_EXCEED_SCRAP_THRESHOLD'),
        ).toBe(true)
    })

    it('rejects action vocabularies containing fewer than 3 kinetic verbs', () => {
        const sparseVerbs = ['LIMP', 'SIPHON']
        const errors = evaluateActionVocabularyRule(sparseVerbs)
        expect(
            errors.some((e) => e.code === 'ACTION_VOCABULARY_MINIMUM_UNMET'),
        ).toBe(true)
    })

    it('rejects lowercase kinetic verbs and duplicate verbs', () => {
        const invalidVerbs = ['LIMP', 'siphon', 'SIPHON']
        const errors = evaluateActionVocabularyRule(invalidVerbs)
        expect(
            errors.some((e) => e.code === 'KINETIC_VERB_FORMAT_INVALID'),
        ).toBe(true)
        expect(errors.some((e) => e.code === 'DUPLICATE_KINETIC_VERB')).toBe(
            true,
        )
    })

    it('rejects farce ratio ceilings exceeding 1500 bps (15.00%)', () => {
        const excessiveFarce = {
            max_farce_ratio_bps: 1501,
            min_escalation_depth: 2,
            global_acoustic_floor_cdb: 1500,
            vo_ducking_db: -14,
        }
        const errors = evaluateInvariantLawsRule(excessiveFarce)
        expect(
            errors.some(
                (e) =>
                    e.code === 'BASIS_POINTS_OUT_OF_BOUNDS' ||
                    e.code === 'FARCE_RATIO_EXCEEDS_CEILING',
            ),
        ).toBe(true)
    })

    it('rejects target frame rates other than exact integer 24', () => {
        const invalidFps = {
            tts_port: 8000,
            comfy_port: 8188,
            target_fps: 30,
            lora_trigger_tokens: ['test'],
        }
        const errors = evaluateMediumProjectionsRule(invalidFps)
        expect(errors.some((e) => e.code === 'TARGET_FPS_NOT_24')).toBe(true)
    })

    it('produces deterministic RFC 8785 canonical JSON with sorted dictionary keys', () => {
        const objA = { b: 2, a: 1 }
        const objB = { a: 1, b: 2 }
        expect(canonicalizeTupleJson(objA)).toBe('{"a":1,"b":2}')
        expect(canonicalizeTupleJson(objA)).toBe(canonicalizeTupleJson(objB))
    })

    it('throws fatal TypeError when canonicalizing non-finite floats', () => {
        expect(() => canonicalizeTupleJson(NaN)).toThrow(TypeError)
        expect(() => canonicalizeTupleJson(Infinity)).toThrow(TypeError)
    })
})
