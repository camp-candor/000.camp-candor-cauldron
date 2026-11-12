import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Phase 1 Single-Page Hygiene Routing Gauntlet', () => {
    const pagesDir = path.resolve(__dirname, '../../src/pages')

    it('asserts src/pages contains only the index landing page', () => {
        const entries = fs.readdirSync(pagesDir)
        expect(entries).toEqual(['index.astro'])
    })

    it('asserts physical eviction of vestigial play routes', () => {
        const playPath = path.join(pagesDir, 'play')
        expect(fs.existsSync(playPath)).toBe(false)
    })

    it('asserts physical eviction of vestigial market routes', () => {
        const marketPath = path.join(pagesDir, 'market')
        expect(fs.existsSync(marketPath)).toBe(false)
    })

    it('asserts physical eviction of vestigial runner routes', () => {
        const runnerPath = path.join(pagesDir, 'runner')
        expect(fs.existsSync(runnerPath)).toBe(false)
    })

    it('asserts physical eviction of multi-route scaffolding', () => {
        for (const vestige of [
            'api',
            'series',
            'scenes',
            'cauldron',
            'episodes',
            'guest',
            'telemetry',
            'login.astro',
            'signup.astro',
            'character-selection.astro',
            'iframe.astro',
        ]) {
            expect(
                fs.existsSync(path.join(pagesDir, vestige)),
                `Vestigial route still on disk: ${vestige}`,
            ).toBe(false)
        }
    })

    it('asserts removal of synthetic telemetry gitAgent mock', () => {
        const gitAgentPath = path.join(pagesDir, 'api/gitAgent.ts')
        expect(fs.existsSync(gitAgentPath)).toBe(false)
    })

    it('asserts retirement of the standalone health API endpoint', () => {
        const healthPath = path.join(pagesDir, 'api/health.ts')
        expect(fs.existsSync(healthPath)).toBe(false)
    })

    it('asserts index.astro renders the static cauldron status landing', () => {
        const indexPath = path.join(pagesDir, 'index.astro')
        expect(fs.existsSync(indexPath)).toBe(true)

        const content = fs.readFileSync(indexPath, 'utf8')
        const isCleanAscii = /^[\x00-\x7F]*$/.test(content)
        expect(isCleanAscii).toBe(true)
        expect(content).toContain('CAULDRON STATUS // CAMP CANDOR')
        expect(content).toContain('T0_ZERO_SPEND')
        expect(content).toContain('05.DELIVERY')
        expect(content).toContain('RIG_1_CONDUCTOR')
        expect(content).toContain('[UNBOUND]')
        expect(content).toContain(
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
        expect(content).not.toContain('Astro.redirect')
        expect(content).not.toContain('/series/new')
        expect(content).not.toContain('/scenes/')
        expect(content).not.toContain('Chronicles.astro')
        expect(content).not.toContain('LifeLog.astro')
    })

    it('asserts zero client JavaScript on the single-page landing', () => {
        const content = fs.readFileSync(
            path.join(pagesDir, 'index.astro'),
            'utf8',
        )
        expect(content).not.toMatch(/<script\b[^>]*>/i)
        expect(content).not.toContain('client:load')
        expect(content).not.toContain('client:idle')
        expect(content).not.toContain('client:visible')
        expect(content).not.toContain('client:only')
        expect(content).not.toContain('onclick=')
    })
})
