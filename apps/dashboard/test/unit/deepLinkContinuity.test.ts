/**
 * apps/dashboard/test/unit/deepLinkContinuity.test.ts
 *
 * Vitest Test Battery for Deep-Link Continuity & Route Refresh State Hydration.
 * Verifies URL synthesis, envelope validation, history formatting, and 7-bit ASCII purity.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    synthesizeContainerUrl,
    validateRouteChangedEnvelope,
    formatHostDisplayUrl,
    mirrorRouteToHostHistory,
    normalizeBaseUrl,
} from '../../src/lib/routing/deepLinkBridge'

describe('DEEP-LINK CONTINUITY & ROUTE REFRESH GAUNTLET', () => {
    const bridgePath = path.resolve(
        __dirname,
        '../../src/lib/routing/deepLinkBridge.ts',
    )
    const scenePagePath = path.resolve(
        __dirname,
        '../../src/pages/scenes/[id].astro',
    )
    const stagePath = path.resolve(
        __dirname,
        '../../src/components/viewport/ViewportStage.astro',
    )

    it('[LEVEL 0] Target Inodes Verification', () => {
        expect(
            fs.existsSync(bridgePath),
            'deepLinkBridge.ts must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(scenePagePath),
            'scenes/[id].astro must stay evicted (single-page contract)',
        ).toBe(false)
        expect(
            fs.existsSync(stagePath),
            'ViewportStage.astro must exist on disk',
        ).toBe(true)
    })

    it('[LEVEL 1] Pure 7-Bit Clean ASCII Integrity Verification', () => {
        const files = [bridgePath, stagePath]
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

    it('[LEVEL 2] Container URL Synthesis with Staged Entities and Queries', () => {
        const base = 'https://preview-app.pages.dev/editor/'
        const result = synthesizeContainerUrl(base, {
            entityId: 'ep101_sc014',
            sceneId: 'sc014',
            draftId: 'stg_991',
            focus: 'timeline',
            customParams: { revision: 'rev_3' },
        })

        const parsed = new URL(result)
        expect(parsed.origin).toBe('https://preview-app.pages.dev')
        expect(parsed.pathname).toBe('/editor')
        expect(parsed.searchParams.get('entity')).toBe('ep101_sc014')
        expect(parsed.searchParams.get('sceneId')).toBe('sc014')
        expect(parsed.searchParams.get('draft')).toBe('stg_991')
        expect(parsed.searchParams.get('focus')).toBe('timeline')
        expect(parsed.searchParams.get('revision')).toBe('rev_3')
    })

    it('[LEVEL 3] Route Changed Envelope Validation and Sanitization', () => {
        // Valid envelope
        const valid = validateRouteChangedEnvelope({
            type: 'ROUTE_CHANGED',
            payload: { path: '/scenes/sc_015', query: { draft: 'stg_992' } },
        })
        expect(valid).not.toBeNull()
        expect(valid?.payload.path).toBe('/scenes/sc_015')
        expect(valid?.payload.query?.draft).toBe('stg_992')

        // Invalid envelope: bad type
        expect(validateRouteChangedEnvelope({ type: 'OTHER_TYPE' })).toBeNull()

        // Invalid envelope: non-relative or open-redirect path
        expect(
            validateRouteChangedEnvelope({
                type: 'ROUTE_CHANGED',
                payload: { path: 'https://malicious.com' },
            }),
        ).toBeNull()
        expect(
            validateRouteChangedEnvelope({
                type: 'ROUTE_CHANGED',
                payload: { path: '//protocol-relative.com' },
            }),
        ).toBeNull()
    })

    it('[LEVEL 4] Host History Display URL Formatting', () => {
        const formatted = formatHostDisplayUrl('/scenes/sc_014', {
            draft: 'stg_991',
            view: 'split',
        })
        expect(formatted).toBe('/scenes/sc_014?draft=stg_991&view=split')
    })

    it('[LEVEL 5] Mirror Route to Host History replaceState Call', () => {
        const replaceStateMock = vi.fn()
        vi.stubGlobal('window', {
            location: { pathname: '/scenes/sc_014', search: '' },
            history: { replaceState: replaceStateMock },
        })

        mirrorRouteToHostHistory('/scenes/sc_015', { draft: 'stg_992' })
        expect(replaceStateMock).toHaveBeenCalledWith(
            null,
            '',
            '/scenes/sc_015?draft=stg_992',
        )

        // Idempotent check: calling with same URL does not trigger replaceState
        replaceStateMock.mockClear()
        vi.stubGlobal('window', {
            location: { pathname: '/scenes/sc_015', search: '?draft=stg_992' },
            history: { replaceState: replaceStateMock },
        })
        mirrorRouteToHostHistory('/scenes/sc_015', { draft: 'stg_992' })
        expect(replaceStateMock).not.toHaveBeenCalled()

        vi.unstubAllGlobals()
    })
})
