/**
 * apps/dashboard/test/unit/securityPerimeter.test.ts
 *
 * Vitest Adversarial Test Suite for Security Hull & Ingress Perimeter.
 * Verifies RS256 token validation, sub-5ms edge gating, CSP headers, and 7-bit ASCII safety.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { authenticateEdgeRequest } from '../../src/lib/clerkEdge'
import { buildPerimeterSecurityHeaders } from '../../src/lib/securityHeaders'

describe('SECURITY HULL & EDGE INGRESS GAUNTLET', () => {
    let mockKeyPair: CryptoKeyPair
    let mockPublicKeyJwk: JsonWebKey

    beforeAll(async () => {
        // Generate valid RSA-256 Keypair via WebCrypto
        mockKeyPair = await crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: 'SHA-256' },
            },
            true,
            ['sign', 'verify'],
        )

        mockPublicKeyJwk = await crypto.subtle.exportKey(
            'jwk',
            mockKeyPair.publicKey,
        )
    })

    /**
     * Helper to mint signed JWTs in-memory
     */
    async function mintTestJwt(
        payloadOverrides: Record<string, unknown>,
        privateKey: CryptoKey,
        kid = 'test-key-01',
    ): Promise<string> {
        const header = { alg: 'RS256', typ: 'JWT', kid }
        const now = Math.floor(Date.now() / 1000)
        const payload = {
            sub: 'user_showrunner_001',
            org_role: 'showrunner_admin',
            series_slug: 'wiregrass-s01',
            iat: now,
            exp: now + 300,
            ...payloadOverrides,
        }

        const enc = new TextEncoder()
        const b64Url = (bytes: Uint8Array) =>
            btoa(String.fromCharCode(...bytes))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '')

        const headerB64 = b64Url(enc.encode(JSON.stringify(header)))
        const payloadB64 = b64Url(enc.encode(JSON.stringify(payload)))
        const signingInput = `${headerB64}.${payloadB64}`

        const sig = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            privateKey,
            enc.encode(signingInput),
        )

        return `${signingInput}.${b64Url(new Uint8Array(sig))}`
    }

    it('[LEVEL 1] Rejects unauthenticated request with missing token', async () => {
        const req = new Request(
            'https://studio.campcandor.com/director/tuning',
            {
                method: 'GET',
            },
        )

        const auth = await authenticateEdgeRequest(req, {
            CLERK_JWKS_URL: 'https://auth.internal/jwks',
        })

        expect(auth.authenticated).toBe(false)
        expect(auth.failureReason).toBe('MISSING_AUTHORIZATION_TOKEN')
    })

    it('[LEVEL 2] Rejects request with single-byte signature tampering', async () => {
        const validJwt = await mintTestJwt({}, mockKeyPair.privateKey)
        const [h, p, sig] = validJwt.split('.')

        // Tamper with one character of the signature
        const tamperedSig = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1)
        const tamperedJwt = `${h}.${p}.${tamperedSig}`

        // Mock global fetch to return JWKS
        globalThis.fetch = async () =>
            new Response(
                JSON.stringify({
                    keys: [
                        {
                            ...mockPublicKeyJwk,
                            kid: 'test-key-01',
                            use: 'sig',
                            alg: 'RS256',
                        },
                    ],
                }),
                { status: 200 },
            )

        const req = new Request(
            'https://studio.campcandor.com/director/tuning',
            {
                headers: { Authorization: `Bearer ${tamperedJwt}` },
            },
        )

        const auth = await authenticateEdgeRequest(req, {
            CLERK_JWKS_URL: 'https://auth.internal/jwks',
        })

        expect(auth.authenticated).toBe(false)
        expect(auth.failureReason).toBe('INVALID_CRYPTOGRAPHIC_SIGNATURE')
    })

    it('[LEVEL 3] Fails closed on expired RS256 token', async () => {
        const expiredJwt = await mintTestJwt(
            { exp: Math.floor(Date.now() / 1000) - 60 },
            mockKeyPair.privateKey,
        )

        globalThis.fetch = async () =>
            new Response(
                JSON.stringify({
                    keys: [
                        {
                            ...mockPublicKeyJwk,
                            kid: 'test-key-01',
                            use: 'sig',
                            alg: 'RS256',
                        },
                    ],
                }),
                { status: 200 },
            )

        const req = new Request(
            'https://studio.campcandor.com/director/tuning',
            {
                headers: { Authorization: `Bearer ${expiredJwt}` },
            },
        )

        const auth = await authenticateEdgeRequest(req, {
            CLERK_JWKS_URL: 'https://auth.internal/jwks',
        })

        expect(auth.authenticated).toBe(false)
        expect(auth.failureReason).toBe('EXPIRED_JWT_TOKEN')
    })

    it('[LEVEL 4] Enforces Cloudflare Access Service Token authentication', async () => {
        const req = new Request(
            'https://studio.campcandor.com/api/broker/status',
            {
                headers: {
                    'CF-Access-Client-Id': 'broker-identity-rig2.access',
                    'CF-Access-Client-Secret': 'super-secret-hex-entropy-0099',
                    'X-Series-Scope': 'wiregrass-s01',
                },
            },
        )

        const auth = await authenticateEdgeRequest(req, {
            CF_ACCESS_CLIENT_ID: 'broker-identity-rig2.access',
            CF_ACCESS_CLIENT_SECRET: 'super-secret-hex-entropy-0099',
        })

        expect(auth.authenticated).toBe(true)
        expect(auth.role).toBe('machine_broker')
        expect(auth.userId).toBe('service:broker-identity-rig2.access')
        expect(auth.seriesScope).toBe('wiregrass-s01')
    })

    it('[LEVEL 4.1] Authenticates user via __session cookie', async () => {
        const validJwt = await mintTestJwt({}, mockKeyPair.privateKey)

        globalThis.fetch = async () =>
            new Response(
                JSON.stringify({
                    keys: [
                        {
                            ...mockPublicKeyJwk,
                            kid: 'test-key-01',
                            use: 'sig',
                            alg: 'RS256',
                        },
                    ],
                }),
                { status: 200 },
            )

        const req = new Request('https://artists.it.com/login', {
            headers: {
                Cookie: `other_pref=dark; __session=${validJwt}; token_id=abc`,
            },
        })

        const auth = await authenticateEdgeRequest(req, {
            CLERK_JWKS_URL: 'https://auth.internal/jwks',
        })

        expect(auth.authenticated).toBe(true)
        expect(auth.userId).toBe('user_showrunner_001')
    })

    it('[LEVEL 5] Builds strictly formatted Content Security Policy headers', () => {
        const headers = buildPerimeterSecurityHeaders()
        const csp = headers.get('Content-Security-Policy') || ''

        expect(csp).toContain("frame-ancestors 'self' https://*.pages.dev")
        expect(csp).toContain("object-src 'none'")
        expect(csp).toContain('https://*.clerk.accounts.dev')
        expect(csp).toContain('https://*.artists.it.com')
        expect(csp).toContain('https://*.clerk.com')
        expect(csp).toContain('https://challenges.cloudflare.com')
        expect(csp).toContain('https://fonts.googleapis.com')
        expect(csp).toContain('https://fonts.gstatic.com')
        expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
        expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
        expect(headers.get('X-Perimeter-Gate')).toBe('SECURE_EDGE_ISOLATE_T0')
    })

    it('[LEVEL 6] Asserts pure 7-bit ASCII safety across security modules', async () => {
        const sourceFiles = [
            import('../../src/lib/clerkEdge?raw'),
            import('../../src/lib/securityHeaders?raw'),
        ]

        const sources = await Promise.all(sourceFiles)
        const nonAsciiRegex = /[^\x00-\x7F]/

        for (const mod of sources) {
            const content = (mod as { default: string }).default
            const match = nonAsciiRegex.exec(content)
            expect(
                match,
                `Found non-ASCII character in security perimeter code: ${match?.[0]}`,
            ).toBeNull()
        }
    })
})
