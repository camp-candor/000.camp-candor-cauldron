/**
 * apps/dashboard/test/unit/defensiveSandbox.test.ts
 *
 * Vitest Adversarial Test Battery for Defensive Invariants, Sandboxing & Threat Neutralization.
 * Verifies Zero-Byte Poison Sentinel, Path Traversal Defense, Structural Intent Validation,
 * and pure 7-bit clean ASCII compliance.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    assertNoPathTraversal,
    assertNonPoisonPayload,
    sanitizeAsciiTelemetry,
    compileIframeSandboxPolicy,
    validateIntentEnvelope,
    EMPTY_SHA256_HASH,
} from '../../src/lib/security/sandboxGuard'

describe('DEFENSIVE INVARIANTS & SANDBOX GAUNTLET', () => {
    const guardPath = path.resolve(
        __dirname,
        '../../src/lib/security/sandboxGuard.ts',
    )
    const airlockPath = path.resolve(
        __dirname,
        '../../src/components/security/SandboxedAirlock.astro',
    )
    const middlewarePath = path.resolve(__dirname, '../../src/middleware.ts')

    it('[LEVEL 0] Target Inodes Verification', () => {
        expect(
            fs.existsSync(guardPath),
            'sandboxGuard.ts must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(airlockPath),
            'SandboxedAirlock.astro must exist on disk',
        ).toBe(true)
        expect(
            fs.existsSync(middlewarePath),
            'middleware.ts must exist on disk',
        ).toBe(true)
    })

    it('[LEVEL 1] Pure 7-Bit Clean ASCII Integrity Verification', () => {
        const files = [guardPath, airlockPath, middlewarePath]
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

    it('[LEVEL 2] Path Traversal and Shell Delimiter Trapping', () => {
        // Valid relative path
        expect(() =>
            assertNoPathTraversal('scenes/sc_014.fountain'),
        ).not.toThrow()
        expect(() => assertNoPathTraversal('drafts/take_01.json')).not.toThrow()

        // Traversal attempts
        expect(() => assertNoPathTraversal('../../../etc/passwd')).toThrow(
            /Directory traversal escape/,
        )
        expect(() => assertNoPathTraversal('scenes/../../secrets.env')).toThrow(
            /Directory traversal escape/,
        )
        expect(() => assertNoPathTraversal('scenes\\nested\\file.txt')).toThrow(
            /Directory traversal escape/,
        )

        // Shell injection operators
        expect(() => assertNoPathTraversal('scene_01; rm -rf /')).toThrow(
            /Shell delimiter/,
        )
        expect(() =>
            assertNoPathTraversal('scene_01 && cat /etc/shadow'),
        ).toThrow(/Shell delimiter/)
        expect(() => assertNoPathTraversal('scene_01 | grep token')).toThrow(
            /Shell delimiter/,
        )
        expect(() => assertNoPathTraversal('scene_01`whoami`')).toThrow(
            /Shell delimiter/,
        )

        // Absolute root paths
        expect(() => assertNoPathTraversal('/var/log/syslog')).toThrow(
            /Absolute filesystem roots prohibited/,
        )
        expect(() => assertNoPathTraversal('C:\\Windows\\System32')).toThrow(
            /Absolute filesystem roots prohibited/,
        )
    })

    it('[LEVEL 3] Zero-Byte Poison Sentinel and Byte-Length Floor Trapping', async () => {
        // Zero-byte rejection
        await expect(assertNonPoisonPayload(new Uint8Array(0))).rejects.toThrow(
            /Zero-byte file rejected/,
        )

        // Empty SHA-256 constant rejection
        const emptyString = ''
        await expect(assertNonPoisonPayload(emptyString)).rejects.toThrow(
            /Zero-byte file rejected/,
        )

        // Truncated payload under 1,024 bytes
        const smallPayload = new Uint8Array(512)
        smallPayload.fill(0x20) // ASCII space
        await expect(assertNonPoisonPayload(smallPayload)).rejects.toThrow(
            /falls below floor/,
        )

        // Valid payload >= 1,024 bytes
        const validPayload = new Uint8Array(1024)
        validPayload.fill(0x61) // ASCII 'a'
        const result = await assertNonPoisonPayload(validPayload)
        expect(result.byteLength).toBe(1024)
        expect(result.digest).not.toBe(EMPTY_SHA256_HASH)
    })

    it('[LEVEL 4] 7-Bit ASCII Telemetry Sanitization', () => {
        const cleanLog = '>> [AUTH][OK] Directorial session certified.'
        expect(sanitizeAsciiTelemetry(cleanLog)).toBe(cleanLog)

        const ansiLog = '\x1B[32m>> [OK]\x1B[0m Execution passed'
        expect(sanitizeAsciiTelemetry(ansiLog)).toBe('>> [OK] Execution passed')

        const emojiLog = '>> [OK] Compilation complete \u{1F680}'
        expect(() => sanitizeAsciiTelemetry(emojiLog)).toThrow(
            /Multi-byte non-ASCII character rejected/,
        )
    })

    it('[LEVEL 5] Iframe Sandbox Directives and Navigation Lockout', () => {
        const policy = compileIframeSandboxPolicy()

        expect(policy.sandbox).toContain('allow-scripts')
        expect(policy.sandbox).toContain('allow-same-origin')
        expect(policy.sandbox).toContain('allow-forms')
        expect(policy.sandbox).toContain('allow-downloads')

        // Asserts top-navigation is strictly barred
        expect(policy.sandbox).not.toContain('allow-top-navigation')
        expect(policy.sandbox).not.toContain(
            'allow-top-navigation-by-user-activation',
        )
        expect(policy.sandbox).not.toContain('allow-pointer-lock')
        expect(policy.allow).toBe(
            'clipboard-read; clipboard-write; display-capture',
        )
    })

    it('[LEVEL 6] Structural Firewall Intent Validation with additionalProperties: false', () => {
        const validEnvelope = {
            intent_id: 'intent_1730000000',
            intent_type: 'OVERRIDE_SOMATIC_DEBUFF',
            authorizer_role: 'SHOWRUNNER',
            timestamp_sim_cycle: 42,
            payload: { actor: 'char_wart', debuff: 'sprained_wrist' },
            client_signature: 'sig_valid_hex',
        }

        const res = validateIntentEnvelope(validEnvelope)
        expect(res.valid).toBe(true)

        // Undeclared key injection attempt
        const tamperedEnvelope = {
            ...validEnvelope,
            sudo_mode: true, // Injected undeclared key
        }
        const tamperedRes = validateIntentEnvelope(tamperedEnvelope)
        expect(tamperedRes.valid).toBe(false)
        expect(tamperedRes.failureReason).toContain(
            'STRUCTURAL_FIREWALL_BREACH_UNAPPROVED_KEY',
        )

        // Direct SQL injection pattern in payload
        const sqlPayloadEnvelope = {
            ...validEnvelope,
            payload: { query: 'SELECT * FROM secrets' },
        }
        const sqlRes = validateIntentEnvelope(sqlPayloadEnvelope)
        expect(sqlRes.valid).toBe(false)
        expect(sqlRes.failureReason).toContain('REJECTED_SQL_INJECTION_PATTERN')
    })
})
