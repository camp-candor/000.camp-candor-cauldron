import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('[Epic 4] Proscenium Cockpit Status Controls Gauntlet', () => {
    const chromePath = path.resolve(
        __dirname,
        '../../src/components/chrome/SupervisoryChrome.astro',
    )
    const navPath = path.resolve(
        __dirname,
        '../../src/components/chrome/NavigationSpine.astro',
    )
    const stagePath = path.resolve(
        __dirname,
        '../../src/components/viewport/ViewportStage.astro',
    )

    it('asserts physical existence of proscenium status control inodes', () => {
        expect(fs.existsSync(chromePath)).toBe(true)
        expect(fs.existsSync(navPath)).toBe(true)
        expect(fs.existsSync(stagePath)).toBe(true)
    })

    it('asserts pure 7-bit clean ASCII compliance across proscenium components', () => {
        const files = [chromePath, navPath]
        const asciiRegex = /^[\x00-\x7F]*$/

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8')
            expect(
                asciiRegex.test(content),
                `Found non-ASCII byte in ${file}`,
            ).toBe(true)
        }
    })

    it('asserts zero client JavaScript tags across proscenium status components', () => {
        const files = [chromePath, navPath]
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8')
            expect(content).not.toMatch(/<script\b[^>]*>/i)
            expect(content).not.toContain('client:load')
            expect(content).not.toContain('client:idle')
            expect(content).not.toContain('onclick=')
        }
    })

    it('asserts fail-closed route lockout declarations in NavigationSpine', () => {
        const content = fs.readFileSync(navPath, 'utf8')
        expect(content).toContain('[LOCKED // UNBOUND]')
        expect(content).toContain(
            'cursor-not-allowed opacity-40 pointer-events-none',
        )
        expect(content).toContain('/series/new')
        expect(content).toContain('/director/tuning')
    })

    it('asserts dispatch lockout, zero runway burn, and null Merkle root in SupervisoryChrome', () => {
        const content = fs.readFileSync(chromePath, 'utf8')
        expect(content).toContain('[ DISPATCH_LOCKOUT ENGAGED ]')
        expect(content).toContain('$0.0000/SEC')
        expect(content).toContain(
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
        expect(content).toContain('[UNSEALED]')
        expect(content).toContain('[NONE (UNBOUND)]')
    })

    it('asserts restrictive iframe sandbox policy in ViewportStage', () => {
        const content = fs.readFileSync(stagePath, 'utf8')
        expect(content).toContain('allow-scripts')
        expect(content).toContain('allow-same-origin')
        expect(content).toContain('allow-popups')
        expect(content).not.toContain('allow-top-navigation')
        expect(content).not.toContain('allow-modals')
        expect(content).toContain('PROSCENIUM INERT')
    })
})
