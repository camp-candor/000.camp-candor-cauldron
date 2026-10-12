import { describe, it, expect, vi } from 'vitest'
import { initDashboard } from './buz/dashboard.buzz.js'
import { DashboardModel } from './dashboard.model.js'

describe('dashboard', () => {
    it('should initialize dashboard', () => {
        const model = new DashboardModel()
        const state = {
            hunt: vi.fn().mockResolvedValue({}),
            dispatch: vi.fn(),
        } as any

        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        // Check if initDashboard is a function and can be called
        expect(typeof initDashboard).toBe('function')

        const result = initDashboard(model, bal, state)
        expect(result).toBe(model)
        //expect(slv).toHaveBeenCalledWith({ intBit: { idx: 'init-dashboard' } });
    })

    it('should wake up the dashboard if url is provided', async () => {
        const model = new DashboardModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urldashboard =
            'https://zero00-dashboard.onrender.com/api/dashboard/test'

        const mockResponsedashboard = { status: 'dashboard-awake' }

        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urldashboard) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockResponsedashboard),
                    } as any)
                }
                return Promise.reject(new Error('Unknown URL'))
            })

        initDashboard(model, bal, state)

        // Wait for the promise in initDashboard to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urldashboard)
        expect(slv).toHaveBeenCalledWith({
            intBit: {
                idx: 'init-dashboard',
                dat: {
                    dashboard: mockResponsedashboard,
                },
            },
        })

        globalFetch.mockRestore()
    })

    it('should handle fetch errors', async () => {
        const model = new DashboardModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urldashboard =
            'https://zero00-dashboard.onrender.com/api/dashboard/test'

        const errorMessage = 'Network error'
        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urldashboard) {
                    return Promise.reject(new Error(errorMessage))
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({}),
                } as any)
            })

        initDashboard(model, bal, state)

        // Wait for the promise in initDashboard to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urldashboard)

        expect(slv).toHaveBeenCalledWith({
            intBit: { idx: 'init-dashboard-err', dat: errorMessage },
        })

        globalFetch.mockRestore()
    })
})
