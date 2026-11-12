import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('[Task 2.2] Void State Universe Invariant Briefing Card Assembly Gauntlet', () => {
    const cardPath = path.resolve(
        __dirname,
        '../../src/components/genesis/GenesisBriefingCard.astro',
    )

    it('asserts physical existence of GenesisBriefingCard.astro on disk', () => {
        expect(fs.existsSync(cardPath)).toBe(true)
    })

    it('asserts pure 7-bit clean ASCII compliance in GenesisBriefingCard.astro', () => {
        const content = fs.readFileSync(cardPath, 'utf8')
        const isCleanAscii = /^[\x00-\x7F]*$/.test(content)
        expect(isCleanAscii).toBe(true)
    })

    it('asserts zero client-side JavaScript tags and hydration directives in card', () => {
        const content = fs.readFileSync(cardPath, 'utf8')
        expect(content).not.toMatch(/<script\b[^>]*>/i)
        expect(content).not.toContain('client:load')
        expect(content).not.toContain('client:idle')
        expect(content).not.toContain('client:visible')
        expect(content).not.toContain('onclick=')
    })

    it('asserts presence of the cold-start non-spend invariant badge', () => {
        const content = fs.readFileSync(cardPath, 'utf8')
        expect(content).toContain('T0 = $0.00 / SEC')
        expect(content).toContain('Compute Firewall Active')
    })

    it('asserts presence of the dispatch lockout warning badge', () => {
        const content = fs.readFileSync(cardPath, 'utf8')
        expect(content).toContain('[ DISPATCH LOCKOUT ENGAGED ]')
        expect(content).toContain(
            'AWAITING OPERATOR INPUT :: T_0 CEILING ENFORCED',
        )
    })

    it('asserts default 64-zero unsealed Merkle root string representation', () => {
        const content = fs.readFileSync(cardPath, 'utf8')
        expect(content).toContain(
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
        expect(content).toContain('[UNSEALED]')
    })

    it('asserts presence of all four constitutional narrative 4-tuple sections', () => {
        const content = fs.readFileSync(cardPath, 'utf8')
        expect(content).toContain('State Space (S)')
        expect(content).toContain('Action Vocabulary (A)')
        expect(content).toContain('Invariant Laws (I)')
        expect(content).toContain('Medium Projections (Rm)')
        expect(content).toContain('[ + INITIALIZE FIRST SERIES >> ]')
    })
})
