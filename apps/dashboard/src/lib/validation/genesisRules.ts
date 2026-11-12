/**
 * apps/dashboard/src/lib/validation/genesisRules.ts
 *
 * Local Non-Compute Genesis Form Validation Rule Evaluator.
 * Pure synchronous validation logic executing without network IO at T_0 = $0.00.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import {
    type GenesisTuplePayload,
    type StateSpaceInput,
    type InvariantLawsInput,
    type MediumProjectionsInput,
    type ValidationReceipt,
    type RuleViolation,
    SLUG_REGEX,
    KINETIC_VERB_REGEX,
    LORA_TOKEN_REGEX,
    GENRE_MODALITIES,
} from './genesisSchema'

export function assertPureAscii(
    text: string,
    fieldName: string,
): RuleViolation | null {
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) > 0x7f) {
            return {
                field: fieldName,
                code: 'NON_ASCII_CHARACTER_DETECTED',
                message: `Field '${fieldName}' contains non-ASCII character at index ${i}.`,
            }
        }
    }
    return null
}

export function assertIntegerBasisPoints(
    val: number,
    fieldName: string,
    maxBps = 10000,
): RuleViolation | null {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
        return {
            field: fieldName,
            code: 'NON_FINITE_NUMERIC_VALUE',
            message: `Field '${fieldName}' must evaluate to a finite numeric value.`,
        }
    }
    if (!Number.isInteger(val)) {
        return {
            field: fieldName,
            code: 'FLOAT_PROHIBITED',
            message: `Field '${fieldName}' strictly prohibits floating-point numbers; integer basis points required.`,
        }
    }
    if (val < 0 || val > maxBps) {
        return {
            field: fieldName,
            code: 'BASIS_POINTS_OUT_OF_BOUNDS',
            message: `Field '${fieldName}' must reside between 0 and ${maxBps} basis points.`,
        }
    }
    return null
}

export function evaluateSeriesSlugRule(slug: string): RuleViolation[] {
    const violations: RuleViolation[] = []
    if (!slug || slug.trim().length === 0) {
        violations.push({
            field: 'series_slug',
            code: 'SERIES_SLUG_REQUIRED',
            message: 'Series slug is required.',
        })
        return violations
    }

    const asciiError = assertPureAscii(slug, 'series_slug')
    if (asciiError) violations.push(asciiError)

    if (slug.length < 3 || slug.length > 48) {
        violations.push({
            field: 'series_slug',
            code: 'SERIES_SLUG_LENGTH_INVALID',
            message: 'Series slug must contain between 3 and 48 characters.',
        })
    }

    if (!SLUG_REGEX.test(slug)) {
        violations.push({
            field: 'series_slug',
            code: 'SERIES_SLUG_FORMAT_INVALID',
            message:
                'Series slug must be lowercase alphanumeric with single-hyphen delimiters.',
        })
    }

    return violations
}

export function evaluateStateSpaceRule(
    space: StateSpaceInput,
): RuleViolation[] {
    const violations: RuleViolation[] = []
    if (!space || typeof space !== 'object') {
        violations.push({
            field: 'state_space',
            code: 'STATE_SPACE_OBJECT_REQUIRED',
            message: 'State space object configuration is required.',
        })
        return violations
    }

    const scarcityErr = assertIntegerBasisPoints(
        space.scarcity_index_bps,
        'scarcity_index_bps',
        10000,
    )
    if (scarcityErr) violations.push(scarcityErr)

    const paranoiaErr = assertIntegerBasisPoints(
        space.paranoia_baseline_bps,
        'paranoia_baseline_bps',
        10000,
    )
    if (paranoiaErr) violations.push(paranoiaErr)

    if (
        !Number.isInteger(space.scrap_max_grams) ||
        space.scrap_max_grams <= 0 ||
        space.scrap_max_grams > 100
    ) {
        violations.push({
            field: 'scrap_max_grams',
            code: 'SCRAP_MAX_GRAMS_OUT_OF_BOUNDS',
            message:
                'Scrap threshold must be an integer between 1 and 100 grams.',
        })
    }

    if (
        !Number.isInteger(space.weight_max_grams) ||
        space.weight_max_grams < 500 ||
        space.weight_max_grams > 50000
    ) {
        violations.push({
            field: 'weight_max_grams',
            code: 'WEIGHT_MAX_GRAMS_OUT_OF_BOUNDS',
            message:
                'Weight maximum threshold must be an integer between 500 and 50000 grams.',
        })
    }

    if (
        Number.isInteger(space.scrap_max_grams) &&
        Number.isInteger(space.weight_max_grams)
    ) {
        if (space.weight_max_grams <= space.scrap_max_grams) {
            violations.push({
                field: 'weight_max_grams',
                code: 'WEIGHT_MUST_EXCEED_SCRAP_THRESHOLD',
                message:
                    'Weight maximum threshold must be strictly greater than scrap maximum grams.',
            })
        }
    }

    return violations
}

export function evaluateActionVocabularyRule(
    actions: readonly string[],
): RuleViolation[] {
    const violations: RuleViolation[] = []
    if (!Array.isArray(actions) || actions.length < 3) {
        violations.push({
            field: 'action_vocabulary',
            code: 'ACTION_VOCABULARY_MINIMUM_UNMET',
            message:
                'Action vocabulary requires a minimum of 3 discrete kinetic verbs.',
        })
        return violations
    }

    const seen = new Set<string>()
    for (let i = 0; i < actions.length; i++) {
        const verb = actions[i]
        if (typeof verb !== 'string') {
            violations.push({
                field: `action_vocabulary[${i}]`,
                code: 'VERB_NOT_A_STRING',
                message: `Action verb at index ${i} must be a string.`,
            })
            continue
        }

        const asciiErr = assertPureAscii(verb, `action_vocabulary[${i}]`)
        if (asciiErr) violations.push(asciiErr)

        if (!KINETIC_VERB_REGEX.test(verb)) {
            violations.push({
                field: `action_vocabulary[${i}]`,
                code: 'KINETIC_VERB_FORMAT_INVALID',
                message: `Verb '${verb}' must be uppercase alphanumeric starting with an alphabetic character.`,
            })
        }

        if (seen.has(verb.toUpperCase())) {
            violations.push({
                field: `action_vocabulary[${i}]`,
                code: 'DUPLICATE_KINETIC_VERB',
                message: `Duplicate action verb '${verb}' detected in vocabulary.`,
            })
        }
        seen.add(verb.toUpperCase())
    }

    return violations
}

export function evaluateInvariantLawsRule(
    invariants: InvariantLawsInput,
): RuleViolation[] {
    const violations: RuleViolation[] = []
    if (!invariants || typeof invariants !== 'object') {
        violations.push({
            field: 'invariants',
            code: 'INVARIANTS_OBJECT_REQUIRED',
            message: 'Invariant laws object configuration is required.',
        })
        return violations
    }

    const farceErr = assertIntegerBasisPoints(
        invariants.max_farce_ratio_bps,
        'max_farce_ratio_bps',
        1500,
    )
    if (farceErr) {
        violations.push(farceErr)
    } else if (invariants.max_farce_ratio_bps > 1500) {
        violations.push({
            field: 'max_farce_ratio_bps',
            code: 'FARCE_RATIO_EXCEEDS_CEILING',
            message: 'Farce ratio ceiling cannot exceed 1500 bps (15.00%).',
        })
    }

    if (
        !Number.isInteger(invariants.min_escalation_depth) ||
        invariants.min_escalation_depth < 2
    ) {
        violations.push({
            field: 'min_escalation_depth',
            code: 'ESCALATION_DEPTH_BELOW_MINIMUM',
            message:
                'Minimum escalation depth must be an integer greater than or equal to 2.',
        })
    }

    if (
        !Number.isInteger(invariants.global_acoustic_floor_cdb) ||
        invariants.global_acoustic_floor_cdb < 500 ||
        invariants.global_acoustic_floor_cdb > 10000
    ) {
        violations.push({
            field: 'global_acoustic_floor_cdb',
            code: 'ACOUSTIC_FLOOR_OUT_OF_BOUNDS',
            message:
                'Global acoustic floor must be an integer between 500 and 10000 centibels.',
        })
    }

    if (
        !Number.isInteger(invariants.vo_ducking_db) ||
        invariants.vo_ducking_db < -30 ||
        invariants.vo_ducking_db > 0
    ) {
        violations.push({
            field: 'vo_ducking_db',
            code: 'VO_DUCKING_OUT_OF_BOUNDS',
            message:
                'Voiceover ducking must be an integer between -30 dB and 0 dB.',
        })
    }

    return violations
}

export function evaluateMediumProjectionsRule(
    projections: MediumProjectionsInput,
): RuleViolation[] {
    const violations: RuleViolation[] = []
    if (!projections || typeof projections !== 'object') {
        violations.push({
            field: 'medium_projections',
            code: 'MEDIUM_PROJECTIONS_OBJECT_REQUIRED',
            message: 'Medium projections configuration is required.',
        })
        return violations
    }

    if (
        !Number.isInteger(projections.tts_port) ||
        projections.tts_port < 1024 ||
        projections.tts_port > 65535
    ) {
        violations.push({
            field: 'tts_port',
            code: 'TTS_PORT_OUT_OF_BOUNDS',
            message: 'TTS port must be an integer between 1024 and 65535.',
        })
    }

    if (
        !Number.isInteger(projections.comfy_port) ||
        projections.comfy_port < 1024 ||
        projections.comfy_port > 65535
    ) {
        violations.push({
            field: 'comfy_port',
            code: 'COMFY_PORT_OUT_OF_BOUNDS',
            message: 'ComfyUI port must be an integer between 1024 and 65535.',
        })
    }

    if (projections.target_fps !== 24) {
        violations.push({
            field: 'target_fps',
            code: 'TARGET_FPS_NOT_24',
            message:
                'Target FPS is strictly locked to integer 24 frames per second.',
        })
    }

    if (Array.isArray(projections.lora_trigger_tokens)) {
        for (let i = 0; i < projections.lora_trigger_tokens.length; i++) {
            const token = projections.lora_trigger_tokens[i]
            if (typeof token !== 'string' || !LORA_TOKEN_REGEX.test(token)) {
                violations.push({
                    field: `lora_trigger_tokens[${i}]`,
                    code: 'LORA_TOKEN_FORMAT_INVALID',
                    message: `LoRA trigger token '${token}' must be lowercase alphanumeric with underscores.`,
                })
            }
        }
    }

    return violations
}

export function evaluateGenesisTupleMaster(
    candidate: unknown,
): ValidationReceipt {
    const violations: RuleViolation[] = []

    if (!candidate || typeof candidate !== 'object') {
        return {
            valid: false,
            violations: [
                {
                    field: 'root',
                    code: 'PAYLOAD_NOT_AN_OBJECT',
                    message:
                        'Genesis tuple candidate must be a non-null object.',
                },
            ],
            errors: {
                root: 'Genesis tuple candidate must be a non-null object.',
            },
            evaluatedAtMs: 0,
            computeTier: 'T0_ZERO_SPEND',
        }
    }

    const payload = candidate as Partial<GenesisTuplePayload>

    // Slug evaluation
    violations.push(...evaluateSeriesSlugRule(payload.series_slug || ''))

    // Title evaluation
    if (
        !payload.franchise_title ||
        payload.franchise_title.trim().length === 0
    ) {
        violations.push({
            field: 'franchise_title',
            code: 'FRANCHISE_TITLE_REQUIRED',
            message: 'Franchise title is required.',
        })
    } else {
        const asciiErr = assertPureAscii(
            payload.franchise_title,
            'franchise_title',
        )
        if (asciiErr) violations.push(asciiErr)
        if (
            payload.franchise_title.length < 3 ||
            payload.franchise_title.length > 80
        ) {
            violations.push({
                field: 'franchise_title',
                code: 'FRANCHISE_TITLE_LENGTH_INVALID',
                message: 'Franchise title must be between 3 and 80 characters.',
            })
        }
    }

    // Genre evaluation
    if (!payload.genre_tag || !GENRE_MODALITIES.includes(payload.genre_tag)) {
        violations.push({
            field: 'genre_tag',
            code: 'GENRE_TAG_INVALID',
            message: `Genre modality must be one of: ${GENRE_MODALITIES.join(', ')}.`,
        })
    }

    // Central irony evaluation
    if (!payload.central_irony || payload.central_irony.trim().length < 10) {
        violations.push({
            field: 'central_irony',
            code: 'CENTRAL_IRONY_TOO_SHORT',
            message:
                'Central dramatic irony must contain at least 10 characters.',
        })
    } else {
        const asciiErr = assertPureAscii(payload.central_irony, 'central_irony')
        if (asciiErr) violations.push(asciiErr)
        if (payload.central_irony.length > 280) {
            violations.push({
                field: 'central_irony',
                code: 'CENTRAL_IRONY_TOO_LONG',
                message:
                    'Central dramatic irony must not exceed 280 characters.',
            })
        }
    }

    // 4-Tuple Component Evaluations
    violations.push(
        ...evaluateStateSpaceRule(payload.state_space as StateSpaceInput),
    )
    violations.push(
        ...evaluateActionVocabularyRule(
            payload.action_vocabulary as readonly string[],
        ),
    )
    violations.push(
        ...evaluateInvariantLawsRule(payload.invariants as InvariantLawsInput),
    )
    violations.push(
        ...evaluateMediumProjectionsRule(
            payload.medium_projections as MediumProjectionsInput,
        ),
    )

    const errors: Record<string, string> = {}
    for (const v of violations) {
        if (v.field.startsWith('action_vocabulary')) {
            errors.action_vocabulary = v.message
        } else if (v.field.startsWith('root')) {
            errors.root = v.message
        } else {
            errors[v.field] = v.message
        }
    }

    return {
        valid: violations.length === 0,
        violations,
        errors,
        evaluatedAtMs: 0,
        computeTier: 'T0_ZERO_SPEND',
    }
}

export function canonicalizeTupleJson(val: any): string {
    if (val === null) return 'null'
    if (typeof val === 'number') {
        if (!Number.isFinite(val)) {
            throw new TypeError(
                '[NON_FINITE_FLOAT_ERROR] Numbers must be finite.',
            )
        }
        return val.toString()
    }
    if (typeof val === 'boolean') return val ? 'true' : 'false'
    if (typeof val === 'string') {
        return JSON.stringify(val)
    }
    if (Array.isArray(val)) {
        const elements = val.map((elem) => canonicalizeTupleJson(elem))
        return `[${elements.join(',')}]`
    }
    if (typeof val === 'object') {
        const sortedKeys = Object.keys(val).sort()
        const parts = sortedKeys.map(
            (k) => `${JSON.stringify(k)}:${canonicalizeTupleJson(val[k])}`,
        )
        return `{${parts.join(',')}}`
    }
    return ''
}
