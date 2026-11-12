import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('[Task 2.1] Single-Page Status Landing Gauntlet', () => {
    const indexPath = path.resolve(__dirname, '../../src/pages/index.astro')
    const componentsDir = path.resolve(
        __dirname,
        '../../src/components/genesis',
    )

    it('asserts physical existence of index.astro landing on disk', () => {
        expect(fs.existsSync(indexPath)).toBe(true)
    })

    it('asserts physical existence of GenesisBriefingCard.astro on disk', () => {
        const cardPath = path.join(componentsDir, 'GenesisBriefingCard.astro')
        expect(fs.existsSync(cardPath)).toBe(true)
    })

    it('asserts pure 7-bit clean ASCII compliance across landing files', () => {
        const indexContent = fs.readFileSync(indexPath, 'utf8')
        const cardContent = fs.readFileSync(
            path.join(componentsDir, 'GenesisBriefingCard.astro'),
            'utf8',
        )

        const asciiRegex = /^[\x00-\x7F]*$/
        expect(asciiRegex.test(indexContent)).toBe(true)
        expect(asciiRegex.test(cardContent)).toBe(true)
    })

    it('asserts zero client-side JavaScript tags in landing templates', () => {
        const indexContent = fs.readFileSync(indexPath, 'utf8')
        const cardContent = fs.readFileSync(
            path.join(componentsDir, 'GenesisBriefingCard.astro'),
            'utf8',
        )

        expect(indexContent).not.toMatch(/<script\b[^>]*>/i)
        expect(cardContent).not.toMatch(/<script\b[^>]*>/i)
        expect(indexContent).not.toContain('client:load')
        expect(cardContent).not.toContain('client:load')
    })

    it('asserts fail-closed cold-start invariant tokens in templates', () => {
        const indexContent = fs.readFileSync(indexPath, 'utf8')
        const cardContent = fs.readFileSync(
            path.join(componentsDir, 'GenesisBriefingCard.astro'),
            'utf8',
        )

        expect(indexContent).toContain('[UNBOUND]')
        expect(indexContent).toContain(
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
        expect(cardContent).toContain('T0 = $0.00 / SEC')
        expect(cardContent).toContain('DISPATCH LOCKOUT ENGAGED')
        expect(cardContent).toContain('[ + INITIALIZE FIRST SERIES >> ]')
    })
})
