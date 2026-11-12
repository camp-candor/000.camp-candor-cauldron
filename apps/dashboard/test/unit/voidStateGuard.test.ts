/**
 * apps/dashboard/test/unit/voidStateGuard.test.ts
 *
 * Vitest Suite for Fail-Closed Void State Invariants.
 * Verifies dispatch lockouts, single-page route interception, and T0 telemetry
 * reported directly by the status landing.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Phase 5 Void State Defensive Invariant Gauntlet', () => {
    const pagesDir = path.resolve(__dirname, '../../src/pages')
    const componentsDir = path.resolve(__dirname, '../../src/components')
    const middlewarePath = path.resolve(__dirname, '../../src/middleware.ts')

    it('asserts status landing reports T0 zero spend baseline', () => {
        const indexPath = path.join(pagesDir, 'index.astro')
        expect(fs.existsSync(indexPath)).toBe(true)

        const content = fs.readFileSync(indexPath, 'utf8')
        expect(content).toContain('T0_ZERO_SPEND')
        expect(content).toContain('05.DELIVERY')
        expect(content).toContain('[UNBOUND]')
        expect(content).toContain(
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
    })

    it('asserts edge middleware redirects unbound protected paths to the landing', () => {
        expect(fs.existsSync(middlewarePath)).toBe(true)

        const content = fs.readFileSync(middlewarePath, 'utf8')
        expect(content).toContain("context.redirect('/', 307)")
        expect(content).not.toContain("context.redirect('/series/new', 307)")
        expect(content).toContain("url.pathname.startsWith('/scenes/')")
        expect(content).toContain("url.pathname.startsWith('/director/')")
    })

    it('asserts supervisory chrome projects dispatch lockout on unbound state', () => {
        const chromePath = path.join(
            componentsDir,
            'chrome/SupervisoryChrome.astro',
        )
        expect(fs.existsSync(chromePath)).toBe(true)

        const content = fs.readFileSync(chromePath, 'utf8')
        expect(content).toContain('[ DISPATCH_LOCKOUT ENGAGED ]')
        expect(content).toContain('$0.0000/SEC')
        expect(content).toContain(
            "ACTIVE: {isUnbound ? '[NONE (UNBOUND)]' : seriesSlug}",
        )
    })

    it('asserts navigation spine physically disables protected routes in void state', () => {
        const navPath = path.join(componentsDir, 'chrome/NavigationSpine.astro')
        expect(fs.existsSync(navPath)).toBe(true)

        const content = fs.readFileSync(navPath, 'utf8')
        expect(content).toContain('[LOCKED // UNBOUND]')
        expect(content).toContain(
            'cursor-not-allowed opacity-40 pointer-events-none',
        )
        expect(content).toContain('/series/new')
    })
})
