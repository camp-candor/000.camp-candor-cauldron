/**
 * apps/dashboard/test/unit/authIntegrity.test.ts
 *
 * Vitest Test Suite for Authentication Integrity, Middleware Contracts,
 * and Content Security Policy (CSP) Ingress Firewalls.
 *
 * Prevents regressions for:
 * 1. Clerk AuthFn function collision on Astro.locals.auth()
 * 2. Astro v6 locals.runtime.env removal/throw behavior
 * 3. CSP blocking production Clerk scripts, Cloudflare Turnstile, and Google Fonts
 * 4. Layout.astro external domain CSP coverage
 * 5. Pure 7-bit clean ASCII compliance
 */

import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildPerimeterSecurityHeaders } from '../../src/lib/securityHeaders'
import { onRequest } from '../../src/middleware'

describe('AUTH INTEGRITY & MIDDLEWARE CONTRACT GAUNTLET', () => {
    describe('[PILLAR 1] Content Security Policy (CSP) Asset Whitelisting', () => {
        it('allows production Clerk domains and Cloudflare services in script-src', () => {
            const headers = buildPerimeterSecurityHeaders()
            const csp = headers.get('Content-Security-Policy') || ''

            // Extract script-src directive
            const scriptSrc =
                csp.split(';').find((d) => d.trim().startsWith('script-src')) ||
                ''

            expect(
                scriptSrc,
                'script-src must whitelist Clerk development accounts',
            ).toContain('https://*.clerk.accounts.dev')
            expect(
                scriptSrc,
                'script-src must whitelist production Clerk custom domain',
            ).toContain('https://*.artists.it.com')
            expect(
                scriptSrc,
                'script-src must whitelist production Clerk default CDN',
            ).toContain('https://*.clerk.com')
            expect(
                scriptSrc,
                'script-src must whitelist Clerk microservices',
            ).toContain('https://*.clerk.services')
            expect(
                scriptSrc,
                'script-src must whitelist Cloudflare Turnstile challenges',
            ).toContain('https://challenges.cloudflare.com')
            expect(
                scriptSrc,
                'script-src must whitelist Cloudflare Web Analytics',
            ).toContain('https://static.cloudflareinsights.com')
        })

        it('allows Google Fonts stylesheets and webfonts in style-src and font-src', () => {
            const headers = buildPerimeterSecurityHeaders()
            const csp = headers.get('Content-Security-Policy') || ''

            const styleSrc =
                csp.split(';').find((d) => d.trim().startsWith('style-src')) ||
                ''
            const fontSrc =
                csp.split(';').find((d) => d.trim().startsWith('font-src')) ||
                ''

            expect(
                styleSrc,
                'style-src must whitelist Google Fonts CSS',
            ).toContain('https://fonts.googleapis.com')
            expect(
                fontSrc,
                'font-src must whitelist Google Fonts static binaries',
            ).toContain('https://fonts.gstatic.com')
        })

        it('allows Turnstile iframes and worker blobs', () => {
            const headers = buildPerimeterSecurityHeaders()
            const csp = headers.get('Content-Security-Policy') || ''

            const frameSrc =
                csp.split(';').find((d) => d.trim().startsWith('frame-src')) ||
                ''
            const workerSrc =
                csp.split(';').find((d) => d.trim().startsWith('worker-src')) ||
                ''

            expect(
                frameSrc,
                'frame-src must whitelist Cloudflare challenges',
            ).toContain('https://challenges.cloudflare.com')
            expect(
                workerSrc,
                'worker-src must whitelist worker blobs',
            ).toContain('blob:')
        })

        it('guarantees all external domains in Layout.astro are whitelisted in CSP', () => {
            const layoutPath = path.resolve(
                __dirname,
                '../../src/layouts/Layout.astro',
            )
            const layoutContent = fs.readFileSync(layoutPath, 'utf8')
            const headers = buildPerimeterSecurityHeaders()
            const csp = headers.get('Content-Security-Policy') || ''

            // Extract external URLs from href and src attributes
            const urlMatches = layoutContent.matchAll(
                /(?:href|src)=["'](https:\/\/[^"'/]+)/gi,
            )
            for (const match of urlMatches) {
                const origin = match[1]
                expect(
                    csp.includes(origin),
                    `Origin ${origin} referenced in Layout.astro must be permitted by CSP`,
                ).toBe(true)
            }
        })
    })

    describe('[PILLAR 2] Middleware locals.auth Contract & Callable Function Invariant', () => {
        function createMockContext(
            localsOverrides: Record<string, unknown> = {},
            pathname = '/login',
        ) {
            const req = new Request(`https://artists.it.com${pathname}`, {
                headers: new Headers(),
            })
            const url = new URL(req.url)
            const locals = { ...localsOverrides }

            return {
                request: req,
                url,
                locals,
            }
        }

        it('preserves locals.auth as a callable function (AuthFn)', async () => {
            const mockClerkAuth = vi.fn(() => ({
                userId: 'user_studio_001',
                sessionId: 'sess_live_123',
            }))

            const context = createMockContext({
                auth: mockClerkAuth,
            })

            const next = vi.fn().mockResolvedValue(new Response('OK'))

            await onRequest(context as any, next)

            // locals.auth MUST be a function so Astro.locals.auth() works in .astro pages
            expect(
                typeof (context.locals as any).auth,
                'locals.auth must be a function',
            ).toBe('function')

            // Calling it must return the auth info without throwing
            const authResult = (context.locals as any).auth()
            expect(authResult).toBeDefined()
            expect(authResult.userId).toBe('user_studio_001')
            expect(authResult.sessionId).toBe('sess_live_123')

            // Edge auth properties must also be directly readable on the object
            expect(typeof (context.locals as any).auth.authenticated).toBe(
                'boolean',
            )
            expect((context.locals as any).edgeAuth).toBeDefined()
        })

        it('provides a safe callable fallback when Clerk auth is not preset', async () => {
            const context = createMockContext({})
            const next = vi.fn().mockResolvedValue(new Response('OK'))

            await onRequest(context as any, next)

            expect(
                typeof (context.locals as any).auth,
                'locals.auth must be a function even when unauthenticated',
            ).toBe('function')

            // Calling it must safely return null identifiers without throwing
            const authResult = (context.locals as any).auth()
            expect(authResult.userId).toBeNull()
            expect(authResult.sessionId).toBeNull()
            expect(authResult.authenticated).toBe(false)
        })

        it('does not throw when Astro v6 removes locals.runtime.env', async () => {
            // Emulate Astro v6 throwing getter on runtime.env
            const throwingRuntime = {
                get env() {
                    throw new Error(
                        'Astro.locals.runtime.env has been removed in Astro v6.',
                    )
                },
            }

            const context = createMockContext({
                runtime: throwingRuntime,
            })
            const next = vi.fn().mockResolvedValue(new Response('OK'))

            // Middleware execution must not crash
            await expect(onRequest(context as any, next)).resolves.not.toThrow()
        })

        it('allows access to root index path / without triggering path traversal detection', async () => {
            const context = createMockContext({}, '/')
            const next = vi.fn().mockResolvedValue(new Response('OK_INDEX'))

            const response = await onRequest(context as any, next)
            expect(response.status).toBe(200)
            const text = await response.text()
            expect(text).toBe('OK_INDEX')
            expect(next).toHaveBeenCalledTimes(1)
        })

        it('blocks malicious traversal and delimiter attempts at perimeter', async () => {
            const badContext = createMockContext({}, '/scenes%3Brm%20-rf')
            const next = vi
                .fn()
                .mockResolvedValue(new Response('SHOULD_NOT_REACH'))

            const response = await onRequest(badContext as any, next)
            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.error).toBe('FORBIDDEN_PATH_TRAVERSAL_DETECTED')
            expect(next).not.toHaveBeenCalled()
        })
    })

    describe('[PILLAR 3] Pure 7-Bit ASCII Compliance', () => {
        it('asserts pure 7-bit clean ASCII across all auth and middleware files', () => {
            const targetFiles = [
                path.resolve(__dirname, '../../src/middleware.ts'),
                path.resolve(__dirname, '../../src/lib/securityHeaders.ts'),
                path.resolve(__dirname, '../../src/lib/clerkEdge.ts'),
                path.resolve(__dirname, 'authIntegrity.test.ts'),
            ]

            const nonAsciiRegex = /[^\x00-\x7F]/

            for (const file of targetFiles) {
                const content = fs.readFileSync(file, 'utf8')
                const match = nonAsciiRegex.exec(content)
                expect(
                    match,
                    `Found non-ASCII byte in ${path.basename(file)}: ${match?.[0]}`,
                ).toBeNull()
            }
        })
    })
})
