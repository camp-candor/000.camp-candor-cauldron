// apps/worker/src/triage/fileAndPerceptualTriage.ts

/**
 * ============================================================================
 * :: FOUR-TIER DRIFT INSPECTION GAUNTLET - PHASE 1: TIERS 1 & 2 TRIAGE
 * ============================================================================
 * Zero-compute deterministic format filtering paired with metric-space
 * perceptual tensor evaluation.
 */

export interface CandidateAssetMetadata {
    taskId: string
    candidateSha: string
    buffer: Uint8Array
    byteLength: number
    mimeType: string
    width: number
    height: number
    aspectRatio?: number
}

export interface Tier2Metrics {
    lpipsScore: number
    dinov2Distance?: number
    silhouetteEntropy?: number
    pHashCosineDistance?: number
    alphaSpillP99?: number
}

export interface Tier1GateResult {
    passed: boolean
    stage: 'TIER_1'
    violations: string[]
    details: {
        dimensionsValid: boolean
        sizeValid: boolean
        mimeTypeValid: boolean
        magicBytesValid: boolean
        byteLength: number
    }
}

export interface Tier2GateResult {
    passed: boolean
    stage: 'TIER_2'
    action: 'AUTO_PROMOTE' | 'PASS_WITH_WARNING' | 'ESCALATE_TIER_3'
    lpipsScore: number
    warning?: string
    escalateTo?: 'TIER_3'
    violations: string[]
    details: {
        lpipsScore: number
        dinov2Passed?: boolean
        silhouettePassed?: boolean
        pHashDeduplicated?: boolean
        alphaSpillPassed?: boolean
    }
}

export interface CombinedTriageResult {
    passed: boolean
    terminalStage: 'TIER_1' | 'TIER_2'
    status:
        'CLEAN_PASS' | 'PASS_WITH_WARNING' | 'REJECT_FORMAT' | 'ESCALATE_TIER_3'
    tier1Result: Tier1GateResult
    tier2Result?: Tier2GateResult
    telemetry: string[]
}

const MAX_BYTE_SIZE = 5 * 1024 * 1024 // 5 MB
const MIN_BYTE_SIZE = 1024 // 1 KB (Empty-Hash Sentinel)
const TARGET_WIDTH = 1024
const TARGET_HEIGHT = 1024

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46] // "RIFF"
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50] // "WEBP"

/**
 * Validates container magic bytes against PNG and WebP binary signatures.
 */
export function verifyContainerMagicBytes(
    buffer: Uint8Array,
    mimeType: string,
): boolean {
    if (!buffer || buffer.length < 12) {
        return false
    }

    if (mimeType === 'image/png') {
        return PNG_MAGIC.every((byte, idx) => buffer[idx] === byte)
    }

    if (mimeType === 'image/webp') {
        const isRiff = RIFF_MAGIC.every((byte, idx) => buffer[idx] === byte)
        const isWebp = WEBP_MAGIC.every((byte, idx) => buffer[idx + 8] === byte)
        return isRiff && isWebp
    }

    return false
}

/**
 * TIER 1: Deterministic Pixel & Format Gate
 * Validates container signatures, exact dimensions, size boundaries, and MIME types.
 */
export function evaluateTier1FormatGate(
    candidate: CandidateAssetMetadata,
): Tier1GateResult {
    const violations: string[] = []

    // 1. Resolution & Dimension Invariant
    const dimensionsValid =
        candidate.width === TARGET_WIDTH && candidate.height === TARGET_HEIGHT
    if (!dimensionsValid) {
        violations.push(
            `INVALID_CANVAS_DIMENSIONS: Expected ${TARGET_WIDTH}x${TARGET_HEIGHT}, got ${candidate.width}x${candidate.height}`,
        )
    }

    // 2. Size Floor & Ceiling Invariant
    let sizeValid = true
    if (candidate.byteLength <= MIN_BYTE_SIZE) {
        violations.push(
            `SIZE_TOO_SMALL_EMPTY_SENTINEL: Byte length ${candidate.byteLength} <= ${MIN_BYTE_SIZE}`,
        )
        sizeValid = false
    } else if (candidate.byteLength > MAX_BYTE_SIZE) {
        violations.push(
            `SIZE_EXCEEDS_5MB_CAP: Byte length ${candidate.byteLength} > ${MAX_BYTE_SIZE}`,
        )
        sizeValid = false
    }

    // 3. MIME Type Whitelist
    const mimeTypeValid =
        candidate.mimeType === 'image/png' ||
        candidate.mimeType === 'image/webp'
    if (!mimeTypeValid) {
        violations.push(
            `INVALID_MIME_TYPE: Expected image/png or image/webp, got ${candidate.mimeType}`,
        )
    }

    // 4. Magic Byte Verification
    const magicBytesValid = verifyContainerMagicBytes(
        candidate.buffer,
        candidate.mimeType,
    )
    if (!magicBytesValid) {
        violations.push(
            'INVALID_MAGIC_BYTES: Buffer header does not match declared MIME container',
        )
    }

    const passed = violations.length === 0

    return {
        passed,
        stage: 'TIER_1',
        violations,
        details: {
            dimensionsValid,
            sizeValid,
            mimeTypeValid,
            magicBytesValid,
            byteLength: candidate.byteLength,
        },
    }
}

/**
 * TIER 2: Metric-Space Perceptual Gate
 * Evaluates continuous perceptual distance (LPIPS) and secondary embedding metrics.
 */
export function evaluateTier2PerceptualGate(
    metrics: Tier2Metrics,
): Tier2GateResult {
    const violations: string[] = []
    const details: Tier2GateResult['details'] = {
        lpipsScore: metrics.lpipsScore,
    }

    let action: Tier2GateResult['action'] = 'AUTO_PROMOTE'
    let warning: string | undefined
    let escalateTo: 'TIER_3' | undefined

    // 1. Secondary Metric Guards
    if (metrics.dinov2Distance !== undefined) {
        const dinov2Passed = metrics.dinov2Distance <= 0.08
        details.dinov2Passed = dinov2Passed
        if (!dinov2Passed) {
            violations.push(
                `DINOV2_DRIFT_EXCEEDED: Distance ${metrics.dinov2Distance} > 0.08`,
            )
        }
    }

    if (metrics.silhouetteEntropy !== undefined) {
        const silhouettePassed = metrics.silhouetteEntropy < 0.15
        details.silhouettePassed = silhouettePassed
        if (!silhouettePassed) {
            violations.push(
                `SILHOUETTE_ENTROPY_BREACH: Entropy ${metrics.silhouetteEntropy} >= 0.15 nats`,
            )
        }
    }

    if (metrics.pHashCosineDistance !== undefined) {
        const pHashDeduplicated = metrics.pHashCosineDistance > 0.12
        details.pHashDeduplicated = pHashDeduplicated
        if (!pHashDeduplicated) {
            violations.push(
                `PHASH_SEED_DUPLICATE: Cosine distance ${metrics.pHashCosineDistance} <= 0.12`,
            )
        }
    }

    if (metrics.alphaSpillP99 !== undefined) {
        const alphaSpillPassed = metrics.alphaSpillP99 < 12
        details.alphaSpillPassed = alphaSpillPassed
        if (!alphaSpillPassed) {
            violations.push(
                `ALPHA_SPILL_EXCEEDED: 99th percentile green spill ${metrics.alphaSpillP99} >= 12`,
            )
        }
    }

    // 2. Primary LPIPS Routing Arbitration
    if (metrics.lpipsScore > 0.12 || violations.length > 0) {
        action = 'ESCALATE_TIER_3'
        escalateTo = 'TIER_3'
        if (metrics.lpipsScore > 0.12) {
            violations.push(
                `LPIPS_DRIFT_EXCEEDED: Score ${metrics.lpipsScore} > 0.12`,
            )
        }
    } else if (metrics.lpipsScore > 0.05) {
        action = 'PASS_WITH_WARNING'
        warning = `[TIER2] Tolerable perceptual variance detected (LPIPS: ${metrics.lpipsScore})`
    } else {
        action = 'AUTO_PROMOTE'
    }

    const passed = action !== 'ESCALATE_TIER_3'

    return {
        passed,
        stage: 'TIER_2',
        action,
        lpipsScore: metrics.lpipsScore,
        warning,
        escalateTo,
        violations,
        details,
    }
}

/**
 * Unified Pipeline Orchestrator for Tiers 1 and 2
 */
export function evaluateTier1And2Triage(
    candidate: CandidateAssetMetadata,
    metrics?: Tier2Metrics,
): CombinedTriageResult {
    const telemetry: string[] = []
    telemetry.push(
        `>> [TIER1] Interrogating candidate plate ${candidate.candidateSha.slice(0, 8)}...`,
    )

    // Tier 1 Fast-Fail
    const tier1Result = evaluateTier1FormatGate(candidate)
    if (!tier1Result.passed) {
        telemetry.push('>> [TIER1] [FAIL] Format violations detected:')
        tier1Result.violations.forEach((v) => telemetry.push(`   :: ${v}`))
        return {
            passed: false,
            terminalStage: 'TIER_1',
            status: 'REJECT_FORMAT',
            tier1Result,
            telemetry,
        }
    }
    telemetry.push(
        '>> [TIER1] [OK] Format, magic bytes, and dimensions verified.',
    )

    // If no Tier 2 metrics are supplied, return Tier 1 pass
    if (!metrics) {
        return {
            passed: true,
            terminalStage: 'TIER_1',
            status: 'CLEAN_PASS',
            tier1Result,
            telemetry,
        }
    }

    // Tier 2 Perceptual Gating
    telemetry.push(
        '>> [TIER2] Evaluating perceptual tensors and LPIPS drift...',
    )
    const tier2Result = evaluateTier2PerceptualGate(metrics)

    if (tier2Result.action === 'ESCALATE_TIER_3') {
        telemetry.push(
            '>> [TIER2] [ESCALATE] Significant drift detected; escalating to Tier 3:',
        )
        tier2Result.violations.forEach((v) => telemetry.push(`   :: ${v}`))
        return {
            passed: false,
            terminalStage: 'TIER_2',
            status: 'ESCALATE_TIER_3',
            tier1Result,
            tier2Result,
            telemetry,
        }
    }

    if (tier2Result.action === 'PASS_WITH_WARNING') {
        telemetry.push(`>> [TIER2] [WARN] ${tier2Result.warning}`)
        return {
            passed: true,
            terminalStage: 'TIER_2',
            status: 'PASS_WITH_WARNING',
            tier1Result,
            tier2Result,
            telemetry,
        }
    }

    telemetry.push(
        `>> [TIER2] [OK] Clean pass (LPIPS: ${tier2Result.lpipsScore}). Auto-promoted.`,
    )
    return {
        passed: true,
        terminalStage: 'TIER_2',
        status: 'CLEAN_PASS',
        tier1Result,
        tier2Result,
        telemetry,
    }
}
