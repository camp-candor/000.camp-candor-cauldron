/**
 * apps/dashboard/test/unit/quarantineBoundary.test.ts
 *
 * Monorepo Workspace Boundary Quarantine Certification Suite.
 * Asserts zero modifications to packages/ and apps/995.library/.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import path from 'node:path'

describe('Monorepo Quarantine Boundary Certification', () => {
    const repoRoot = path.resolve(__dirname, '../../../../')

    it('asserts packages/ sustains exactly zero modified files', () => {
        let output = ''
        try {
            output = execSync('git status -s packages/', {
                cwd: repoRoot,
                encoding: 'utf8',
            }).trim()
        } catch {
            output = ''
        }
        expect(output, 'Forbidden modifications detected in packages/').toBe('')
    })

    it('asserts apps/995.library/995.library/ sustains exactly zero modified lines', () => {
        let output = ''
        try {
            output = execSync('git status -s apps/995.library/995.library/', {
                cwd: repoRoot,
                encoding: 'utf8',
            }).trim()
        } catch {
            output = ''
        }
        expect(
            output,
            'Forbidden modifications detected in apps/995.library/995.library/',
        ).toBe('')
    })

    it('asserts apps/worker/ sustains exactly zero modified lines', () => {
        let output = ''
        try {
            output = execSync('git status -s apps/worker/', {
                cwd: repoRoot,
                encoding: 'utf8',
            }).trim()
        } catch {
            output = ''
        }
        expect(output, 'Forbidden modifications detected in apps/worker/').toBe(
            '',
        )
    })
})
