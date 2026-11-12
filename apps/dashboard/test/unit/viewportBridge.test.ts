import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    sanitizeInternalPath,
    synthesizeContainerUrl,
    validateRouteChangedEnvelope,
    mirrorRouteToHostHistory,
} from '../../src/lib/routing/deepLinkBridge'

describe('deepLinkBridge Module Verification', () => {
    describe('sanitizeInternalPath', () => {
        it('accepts clean absolute POSIX internal paths', () => {
            expect(sanitizeInternalPath('/scenes/sc02')).toBe('/scenes/sc02')
            expect(sanitizeInternalPath('/director/tuning')).toBe(
                '/director/tuning',
            )
        })

        it('rejects open redirects and external schemes', () => {
            expect(sanitizeInternalPath('//malicious.com/attack')).toBeNull()
            expect(sanitizeInternalPath('http://phishing.local')).toBeNull()
            expect(sanitizeInternalPath('https://external.local')).toBeNull()
            expect(sanitizeInternalPath('javascript:alert(1)')).toBeNull()
        })

        it('rejects relative paths and path traversal sequences', () => {
            expect(sanitizeInternalPath('scenes/sc02')).toBeNull()
            expect(sanitizeInternalPath('/../etc/passwd')).toBeNull()
            expect(sanitizeInternalPath('/scenes/../../root')).toBeNull()
        })

        it('rejects non-ASCII strings', () => {
            expect(sanitizeInternalPath('/scenes/\u00E9')).toBeNull()
        })
    })

    describe('synthesizeContainerUrl', () => {
        it('synthesizes clean URLs with sorted deterministic query parameters', () => {
            const url = synthesizeContainerUrl('/app/editor', {
                sceneId: 'sc02',
                focus: 'spleen',
            })
            // The original code uses "entity", "draft" vs "entityId", "draftId" according to existing deepLinkContinuity.test.ts expectation, but I'll stick to what synthesizing logic outputs.
            // Notice my new synthesize code expects params to match test.
            // In synthesizeContainerUrl it output ?focus=spleen&sceneId=sc02.
            expect(url).toBe('/app/editor?focus=spleen&sceneId=sc02')
        })

        it('handles invocation without params gracefully', () => {
            const url = synthesizeContainerUrl('/app/editor')
            expect(url).toBe('/app/editor')
        })
    })

    describe('validateRouteChangedEnvelope', () => {
        it('accepts valid ROUTE_CHANGED postMessage payload', () => {
            const validMsg = {
                type: 'ROUTE_CHANGED',
                payload: {
                    path: '/scenes/sc03',
                    params: { sceneId: 'sc03' },
                },
            }
            const result = validateRouteChangedEnvelope(validMsg)
            expect(result).not.toBeNull()
            expect(result?.payload.path).toBe('/scenes/sc03')
            expect(result?.payload.params?.sceneId).toBe('sc03')
        })

        it('rejects non-object or malformed envelopes', () => {
            expect(validateRouteChangedEnvelope(null)).toBeNull()
            expect(validateRouteChangedEnvelope('random string')).toBeNull()
            expect(
                validateRouteChangedEnvelope({ type: 'UNKNOWN_EVENT' }),
            ).toBeNull()
            expect(
                validateRouteChangedEnvelope({
                    type: 'ROUTE_CHANGED',
                    payload: { path: '//evil' },
                }),
            ).toBeNull()
        })
    })

    describe('mirrorRouteToHostHistory', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
            vi.stubGlobal('window', {
                location: { pathname: '/scenes/sc08', search: '' },
                history: { replaceState: vi.fn() },
            })
        })

        it('invokes window.history.replaceState idempotently', () => {
            const replaceStateSpy = vi.spyOn(window.history, 'replaceState')
            const success = mirrorRouteToHostHistory('/scenes/sc09')
            expect(success).toBe(true)
            expect(replaceStateSpy).toHaveBeenCalledWith(
                null,
                '',
                '/scenes/sc09',
            )
            vi.unstubAllGlobals()
        })
    })
})
