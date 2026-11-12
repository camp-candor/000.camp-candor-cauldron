import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    assertNoPathTraversal,
    sanitizeAsciiTelemetry,
} from '../../src/lib/security/sandboxGuard'

describe('Phase 4: Astro Cloudflare Edge Runtime Perimeter Defense Gauntlet', () => {
    const guardPath = path.resolve(
        __dirname,
        '../../src/lib/security/sandboxGuard.ts',
    )
    const middlewarePath = path.resolve(__dirname, '../../src/middleware.ts')
    const configPath = path.resolve(__dirname, '../../astro.config.mjs')
    const packagePath = path.resolve(__dirname, '../../package.json')

    it('asserts physical existence of edge perimeter source files', () => {
        expect(fs.existsSync(guardPath)).toBe(true)
        expect(fs.existsSync(middlewarePath)).toBe(true)
        expect(fs.existsSync(configPath)).toBe(true)
        expect(fs.existsSync(packagePath)).toBe(true)
    })

    it('asserts pure 7-bit clean ASCII compliance across edge perimeter files', () => {
        const files = [guardPath, middlewarePath, configPath, packagePath]
        const asciiRegex = /^[\x00-\x7F]*$/

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8')
            expect(
                asciiRegex.test(content),
                `Found non-ASCII byte in ${file}`,
            ).toBe(true)
        }
    })

    it('asserts rejection of directory traversal attempts', () => {
        const badPaths = [
            '/scenes/../../etc/passwd',
            '/scenes/%2e%2e/forbidden',
            '/scenes/%2E%2E/unauthorized',
            '/telemetry//double-slash',
            '/director\\backslash',
            '/director/%5cbackslash',
            '/review/%2fencoded-slash',
        ]

        for (const p of badPaths) {
            expect(
                () => assertNoPathTraversal(p),
                `Failed to reject traversal path: ${p}`,
            ).toThrow(/TRAVERSAL_DETECTED/)
        }
    })

    it('accepts legitimate canonical paths', () => {
        const cleanPaths = [
            '/series/new',
            '/scenes/sc01',
            '/api/health',
            '/telemetry/somatic',
            '/director/tuning',
        ]

        for (const p of cleanPaths) {
            expect(() => assertNoPathTraversal(p)).not.toThrow()
        }
    })

    it('sanitizes multi-byte unicode to safe ASCII tokens', () => {
        const dirty = 'Showrunner \u26A0 Alert \uD83D\uDD25'
        const clean = sanitizeAsciiTelemetry(dirty)
        expect(clean).toContain('[?]')
        expect(/^[\x00-\x7F]*$/.test(clean)).toBe(true)
    })

    it('asserts fail-closed unbound route interception declarations in middleware', () => {
        const content = fs.readFileSync(middlewarePath, 'utf8')
        expect(content).toContain("url.pathname.startsWith('/scenes/')")
        expect(content).toContain("url.pathname.startsWith('/director/')")
        expect(content).toContain("url.pathname.startsWith('/telemetry/')")
        expect(content).toContain("context.redirect('/', 307)")
        expect(content).toContain('TRAVERSAL_DETECTED')
        expect(content).toContain('X-Perimeter-Guard')
    })

    it('asserts Cloudflare edge adapter in astro.config.mjs', () => {
        const content = fs.readFileSync(configPath, 'utf8')
        expect(content).toContain(
            "import cloudflare from '@astrojs/cloudflare'",
        )
        expect(content).toContain('adapter: cloudflare({')
    })
})
