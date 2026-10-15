import { describe, it, expect, vi } from 'vitest'
import { initCauldron } from './buz/cauldron.buzz.js'
import { CauldronModel } from './cauldron.model.js'

describe('cauldron', () => {
    it('should initialize cauldron', () => {
        const model = new CauldronModel()
        const state = {
            hunt: vi.fn().mockResolvedValue({}),
            dispatch: vi.fn(),
        } as any

        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        // Check if initCauldron is a function and can be called
        expect(typeof initCauldron).toBe('function')

        const result = initCauldron(model, bal, state)
        expect(result).toBe(model)
        //expect(slv).toHaveBeenCalledWith({ intBit: { idx: 'init-cauldron' } });
    })

    it('should wake up the cauldron if url is provided', async () => {
        const model = new CauldronModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urlcauldron =
            'https://zero00-cauldron.onrender.com/api/cauldron/test'

        const mockResponsecauldron = { status: 'cauldron-awake' }

        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urlcauldron) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockResponsecauldron),
                    } as any)
                }
                return Promise.reject(new Error('Unknown URL'))
            })

        initCauldron(model, bal, state)

        // Wait for the promise in initCauldron to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urlcauldron)
        expect(slv).toHaveBeenCalledWith({
            intBit: {
                idx: 'init-cauldron',
                dat: {
                    cauldron: mockResponsecauldron,
                },
            },
        })

        globalFetch.mockRestore()
    })

    it('should handle fetch errors', async () => {
        const model = new CauldronModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urlcauldron =
            'https://zero00-cauldron.onrender.com/api/cauldron/test'

        const errorMessage = 'Network error'
        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urlcauldron) {
                    return Promise.reject(new Error(errorMessage))
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({}),
                } as any)
            })

        initCauldron(model, bal, state)

        // Wait for the promise in initCauldron to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urlcauldron)

        expect(slv).toHaveBeenCalledWith({
            intBit: { idx: 'init-cauldron-err', dat: errorMessage },
        })

        globalFetch.mockRestore()
    })
})
