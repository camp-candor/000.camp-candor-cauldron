/**
 * apps/dashboard/test/unit/supervisoryChrome.test.ts
 *
 * Vitest Unit Test Battery for Supervisory Chrome Proscenium Controls.
 * Verifies SSR zero-JS delivery, 7-bit ASCII compliance, null Merkle digest rendering,
 * and Day-Zero navigation route guard assertions.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('SUPERVISORY CHROME PROSCENIUM STATUS AUDIT', () => {
    const chromeSourcePath = path.resolve(
        __dirname,
        '../../src/components/chrome/SupervisoryChrome.astro',
    )
    const navSourcePath = path.resolve(
        __dirname,
        '../../src/components/chrome/NavigationSpine.astro',
    )
    const footerSourcePath = path.resolve(
        __dirname,
        '../../src/components/chrome/TelemetryFooter.astro',
    )
    const layoutSourcePath = path.resolve(
        __dirname,
        '../../src/layouts/ShowrunnerLayout.astro',
    )

    it('[LEVEL 0] Inode Existence Verification', () => {
        expect(
            fs.existsSync(chromeSourcePath),
            'SupervisoryChrome.astro must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(navSourcePath),
            'NavigationSpine.astro must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(footerSourcePath),
            'TelemetryFooter.astro must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(layoutSourcePath),
            'ShowrunnerLayout.astro must exist on disk',
        ).toBe(true)
    })

    it('[LEVEL 1] Zero Client-Side JavaScript Baseline on Outer Proscenium Shell', () => {
        const outerComponents = [
            chromeSourcePath,
            navSourcePath,
            footerSourcePath,
        ]
        for (const comp of outerComponents) {
            const content = fs.readFileSync(comp, 'utf8')
            expect(content).not.toMatch(/<script\b[^>]*>/i)
            expect(content).not.toContain('client:load')
            expect(content).not.toContain('client:idle')
            expect(content).not.toContain('client:visible')
            expect(content).not.toContain('client:only')
            expect(content).not.toContain('onclick=')
        }
    })

    it('[LEVEL 2] Pure 7-Bit Clean ASCII Integrity Verification', () => {
        const files = [
            chromeSourcePath,
            navSourcePath,
            footerSourcePath,
            layoutSourcePath,
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

    it('[LEVEL 3] Null Merkle Root and Dispatch Lockout Assertions in SupervisoryChrome', () => {
        const content = fs.readFileSync(chromeSourcePath, 'utf8')
        expect(content).toContain('SHOWRUNNER COCKPIT')
        expect(content).toContain('05.DELIVERY (AXIS B)')
        expect(content).toContain(
            "ACTIVE: {isUnbound ? '[NONE (UNBOUND)]' : seriesSlug}",
        )
        expect(content).toContain(
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
        expect(content).toContain('DISPATCH_LOCKOUT ENGAGED')
        expect(content).toContain('FAIL_CLOSED')
        expect(content).toContain('$0.0000/SEC')
    })

    it('[LEVEL 4] Day-Zero Route Guard Invariants in NavigationSpine', () => {
        const content = fs.readFileSync(navSourcePath, 'utf8')
        expect(content).toContain('/series/new')
        expect(content).toContain('/director/tuning')
        expect(content).toContain('/telemetry/spatial')
        expect(content).toContain('/review/animatic')
        expect(content).toContain('/telemetry/fleet')
        expect(content).toContain('/finance/burn')
        expect(content).toContain('/director/overrides')
        expect(content).toContain(
            'cursor-not-allowed opacity-40 pointer-events-none',
        )
        expect(content).toContain('[LOCKED // UNBOUND]')
    })
})
