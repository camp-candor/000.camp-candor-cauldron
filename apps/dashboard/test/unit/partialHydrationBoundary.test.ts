/**
 * apps/dashboard/test/unit/partialHydrationBoundary.test.ts
 *
 * Vitest Test Battery for Partial Hydration Boundaries & Static SSR Skeleton.
 * Verifies recursive deep-freeze immutability, JSON thaw client defense,
 * static component scriptlessness, and pure 7-bit ASCII integrity.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { deepFreeze } from '../../src/lib/canon/deepFreeze'

describe('PARTIAL HYDRATION BOUNDARY & SSR SKELETON GAUNTLET', () => {
    const deepFreezePath = path.resolve(
        __dirname,
        '../../src/lib/canon/deepFreeze.ts',
    )
    const staticCardPath = path.resolve(
        __dirname,
        '../../src/components/telemetry/StaticSomaticCard.astro',
    )
    const islandPath = path.resolve(
        __dirname,
        '../../src/components/islands/SomaticAuditInteractive.tsx',
    )
    const landingPagePath = path.resolve(
        __dirname,
        '../../src/pages/index.astro',
    )

    it('[LEVEL 0] Inode Existence Verification', () => {
        expect(
            fs.existsSync(deepFreezePath),
            'deepFreeze.ts must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(staticCardPath),
            'StaticSomaticCard.astro must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(islandPath),
            'SomaticAuditInteractive.tsx must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(landingPagePath),
            'index.astro landing must exist on disk',
        ).toBe(true)
    })

    it('[LEVEL 1] Pure 7-Bit Clean ASCII Integrity Verification', () => {
        const files = [
            deepFreezePath,
            staticCardPath,
            islandPath,
            landingPagePath,
        ]
        const nonAsciiRegex = /[^\x00-\x7F]/

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8')
            const match = nonAsciiRegex.exec(content)
            expect(
                match,
                `Found non-ASCII byte in ${file}: ${match?.[0]}`,
            ).toBeNull()
        }
    })

    it('[LEVEL 2] DeepFreeze Recursive Immutability & TypeError Enforcement', () => {
        const mutableState = {
            actorId: 'char_wart',
            availableArms: 2.0,
            sensoryAcuity: {
                visualAcuity: 0.9,
            },
            bannedVerbs: ['JUMP', 'STRIKE'],
        }

        const sealed = deepFreeze(mutableState)

        // Root-level mutation attempt must throw TypeError
        expect(() => {
            ;(sealed as Record<string, unknown>).availableArms = 1.0
        }).toThrow(TypeError)

        // Nested object mutation attempt must throw TypeError
        expect(() => {
            ;(sealed.sensoryAcuity as Record<string, unknown>).visualAcuity =
                0.2
        }).toThrow(TypeError)

        // Array element append/mutate attempt must throw TypeError
        expect(() => {
            ;(sealed.bannedVerbs as string[]).push('CROUCH')
        }).toThrow(TypeError)
    })

    it('[LEVEL 3] Static SSR Component Scriptlessness (0 KB Client JS)', () => {
        const staticCardContent = fs.readFileSync(staticCardPath, 'utf8')
        expect(staticCardContent).not.toContain('<script')
        expect(staticCardContent).not.toContain('client:load')
        expect(staticCardContent).not.toContain('client:idle')
        expect(staticCardContent).not.toContain('client:visible')
        expect(staticCardContent).not.toContain('WebSocket')
    })

    it('[LEVEL 4] React Island Deserialization Defense & Intent Envelope Structure', () => {
        const islandContent = fs.readFileSync(islandPath, 'utf8')
        expect(islandContent).toContain('deepFreeze(initialMask)')
        expect(islandContent).toContain('DirectorIntentEnvelope')
        expect(islandContent).toContain('OVERRIDE_SOMATIC_DEBUFF')
        expect(islandContent).toContain('/api/v1/intents')
        // Ensure direct SQL execution is absent from React island
        expect(islandContent).not.toContain('SELECT ')
        expect(islandContent).not.toContain('UPDATE ')
        expect(islandContent).not.toContain('env.DB')
    })

    it('[LEVEL 5] Single-Page Landing Static Shell Wiring', () => {
        const pageContent = fs.readFileSync(landingPagePath, 'utf8')
        expect(pageContent).toContain('SupervisoryChrome')
        expect(pageContent).toContain('TelemetryFooter')
        expect(pageContent).not.toContain('client:load')
        expect(pageContent).not.toContain('client:idle')
        expect(pageContent).not.toMatch(/<script\b[^>]*>/i)
    })
})
