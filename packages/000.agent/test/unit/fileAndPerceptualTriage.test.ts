// apps/worker/test/unit/fileAndPerceptualTriage.test.ts
import { describe, it, expect } from 'vitest'
import {
    verifyContainerMagicBytes,
    evaluateTier1FormatGate,
    evaluateTier2PerceptualGate,
    evaluateTier1And2Triage,
    type CandidateAssetMetadata,
    type Tier2Metrics,
} from '../../src/triage/fileAndPerceptualTriage.js'

function createMockPngBuffer(size = 2048): Uint8Array {
    const buf = new Uint8Array(size)
    const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    pngMagic.forEach((b, i) => {
        buf[i] = b
    })
    return buf
}

function createMockWebpBuffer(size = 2048): Uint8Array {
    const buf = new Uint8Array(size)
    // RIFF header
    buf[0] = 0x52
    buf[1] = 0x49
    buf[2] = 0x46
    buf[3] = 0x46
    // WEBP signature
    buf[8] = 0x57
    buf[9] = 0x45
    buf[10] = 0x42
    buf[11] = 0x50
    return buf
}

describe('Tier 1 & Tier 2 File & Perceptual Triage (apps/worker)', () => {
    describe('verifyContainerMagicBytes', () => {
        it('identifies valid PNG container headers', () => {
            const buf = createMockPngBuffer()
            expect(verifyContainerMagicBytes(buf, 'image/png')).toBe(true)
            expect(verifyContainerMagicBytes(buf, 'image/webp')).toBe(false)
        })

        it('identifies valid WebP container headers', () => {
            const buf = createMockWebpBuffer()
            expect(verifyContainerMagicBytes(buf, 'image/webp')).toBe(true)
            expect(verifyContainerMagicBytes(buf, 'image/png')).toBe(false)
        })

        it('rejects corrupt or short buffers', () => {
            const shortBuf = new Uint8Array([0x89, 0x50])
            expect(verifyContainerMagicBytes(shortBuf, 'image/png')).toBe(false)
        })
    })

    describe('Tier 1 Deterministic Pixel & Format Gate', () => {
        it('approves compliant 1024x1024 PNG candidate', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-101',
                candidateSha:
                    'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: createMockPngBuffer(4096),
                byteLength: 4096,
                mimeType: 'image/png',
                width: 1024,
                height: 1024,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(true)
            expect(result.violations).toHaveLength(0)
            expect(result.details.dimensionsValid).toBe(true)
            expect(result.details.magicBytesValid).toBe(true)
        })

        it('approves compliant 1024x1024 WebP candidate', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-102',
                candidateSha:
                    'b1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: createMockWebpBuffer(8192),
                byteLength: 8192,
                mimeType: 'image/webp',
                width: 1024,
                height: 1024,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(true)
        })

        it('rejects candidate with non-conforming dimensions (1024x1025)', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-103',
                candidateSha:
                    'c1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: createMockPngBuffer(2048),
                byteLength: 2048,
                mimeType: 'image/png',
                width: 1024,
                height: 1025,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('INVALID_CANVAS_DIMENSIONS'),
                ),
            ).toBe(true)
        })

        it('rejects payload exceeding 5 MB ceiling', () => {
            const oversized = 5 * 1024 * 1024 + 1
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-104',
                candidateSha:
                    'd1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: createMockPngBuffer(2048),
                byteLength: oversized,
                mimeType: 'image/png',
                width: 1024,
                height: 1024,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('SIZE_EXCEEDS_5MB_CAP'),
                ),
            ).toBe(true)
        })

        it('rejects zero-byte or truncated payload under 1 KB floor', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-105',
                candidateSha:
                    'e1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: createMockPngBuffer(512),
                byteLength: 512,
                mimeType: 'image/png',
                width: 1024,
                height: 1024,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('SIZE_TOO_SMALL_EMPTY_SENTINEL'),
                ),
            ).toBe(true)
        })

        it('rejects non-whitelisted MIME type (image/jpeg)', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-106',
                candidateSha:
                    'f1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: createMockPngBuffer(2048),
                byteLength: 2048,
                mimeType: 'image/jpeg',
                width: 1024,
                height: 1024,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) => v.includes('INVALID_MIME_TYPE')),
            ).toBe(true)
        })

        it('rejects candidate with corrupt magic bytes', () => {
            const corruptBuf = new Uint8Array(2048)
            corruptBuf.fill(0x00)
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-107',
                candidateSha:
                    '1111c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
                buffer: corruptBuf,
                byteLength: 2048,
                mimeType: 'image/png',
                width: 1024,
                height: 1024,
            }

            const result = evaluateTier1FormatGate(candidate)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('INVALID_MAGIC_BYTES'),
                ),
            ).toBe(true)
        })
    })

    describe('Tier 2 Metric-Space Perceptual Gate', () => {
        it('auto-promotes candidate when LPIPS <= 0.05', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.03,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(true)
            expect(result.action).toBe('AUTO_PROMOTE')
            expect(result.escalateTo).toBeUndefined()
        })

        it('passes with warning when LPIPS is in (0.05, 0.12]', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.08,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(true)
            expect(result.action).toBe('PASS_WITH_WARNING')
            expect(result.warning).toContain('Tolerable perceptual variance')
            expect(result.escalateTo).toBeUndefined()
        })

        it('escalates to Tier 3 when LPIPS > 0.12', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.15,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(false)
            expect(result.action).toBe('ESCALATE_TIER_3')
            expect(result.escalateTo).toBe('TIER_3')
            expect(
                result.violations.some((v) =>
                    v.includes('LPIPS_DRIFT_EXCEEDED'),
                ),
            ).toBe(true)
        })

        it('escalates if DINOv2 distance exceeds 0.08 even if LPIPS is low', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.04,
                dinov2Distance: 0.11,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(false)
            expect(result.action).toBe('ESCALATE_TIER_3')
            expect(
                result.violations.some((v) =>
                    v.includes('DINOV2_DRIFT_EXCEEDED'),
                ),
            ).toBe(true)
        })

        it('escalates if silhouette entropy is >= 0.15 nats', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.04,
                silhouetteEntropy: 0.22,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('SILHOUETTE_ENTROPY_BREACH'),
                ),
            ).toBe(true)
        })

        it('rejects candidate if pHash detects seed duplicate (distance <= 0.12)', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.04,
                pHashCosineDistance: 0.09,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('PHASH_SEED_DUPLICATE'),
                ),
            ).toBe(true)
        })

        it('rejects candidate if alpha edge spill exceeds 12 threshold', () => {
            const metrics: Tier2Metrics = {
                lpipsScore: 0.04,
                alphaSpillP99: 14.5,
            }

            const result = evaluateTier2PerceptualGate(metrics)
            expect(result.passed).toBe(false)
            expect(
                result.violations.some((v) =>
                    v.includes('ALPHA_SPILL_EXCEEDED'),
                ),
            ).toBe(true)
        })
    })

    describe('Combined Triage Pipeline', () => {
        it('fast-fails at Tier 1 without executing Tier 2 on format error', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-COMB-01',
                candidateSha:
                    'aaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999',
                buffer: createMockPngBuffer(2048),
                byteLength: 2048,
                mimeType: 'image/png',
                width: 512, // Invalid
                height: 512,
            }

            const metrics: Tier2Metrics = { lpipsScore: 0.02 }
            const result = evaluateTier1And2Triage(candidate, metrics)

            expect(result.passed).toBe(false)
            expect(result.terminalStage).toBe('TIER_1')
            expect(result.status).toBe('REJECT_FORMAT')
            expect(result.tier2Result).toBeUndefined()
        })

        it('passes Tier 1 and Tier 2 smoothly with pure 7-bit ASCII telemetry', () => {
            const candidate: CandidateAssetMetadata = {
                taskId: 'TASK-COMB-02',
                candidateSha:
                    '1234bbbbccccddddeeeeffff0000111122223333444455556666777788889999',
                buffer: createMockPngBuffer(4096),
                byteLength: 4096,
                mimeType: 'image/png',
                width: 1024,
                height: 1024,
            }

            const metrics: Tier2Metrics = { lpipsScore: 0.03 }
            const result = evaluateTier1And2Triage(candidate, metrics)

            expect(result.passed).toBe(true)
            expect(result.terminalStage).toBe('TIER_2')
            expect(result.status).toBe('CLEAN_PASS')

            // Verify ASCII purity across telemetry logs
            const allTelemetry = result.telemetry.join('\n')
            expect(/^[\x00-\x7F]*$/.test(allTelemetry)).toBe(true)
            expect(allTelemetry).toContain('[TIER1] [OK]')
            expect(allTelemetry).toContain('[TIER2] [OK]')
        })
    })
})
