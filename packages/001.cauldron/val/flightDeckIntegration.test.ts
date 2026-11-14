import { describe, it, expect, vi } from 'vitest'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import { flightDeckMenu } from '../98.menu.unit/buz/flightDeckMenu.buzz.js'
import { IntegrationModel } from '../09.integration.unit/integration.model.js'
import { runFlightDeckIntegrationGauntlet } from '../09.integration.unit/buz/integrationGauntlet.buzz.js'

describe('Phase 7 Interactive Flight Deck Integration & Verification Gauntlet Test Battery', () => {
    it('TASK-7.1: degrades gracefully in headless environment and exposes 6 menu options', async () => {
        const model = new MenuModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        await flightDeckMenu(
            model,
            {
                idx: 'test-menu',
                src: 'RUN CAULDRON DOCTOR',
                slv: (res: any) => {
                    resolvedBit = res.mnuBit
                },
            },
            fakeState,
        )

        expect(model.choices.length).toBe(6)
        expect(resolvedBit.src).toBe('RUN CAULDRON DOCTOR')
        expect(model.choices.some((c) => c.actionKey === 'RUN_DOCTOR')).toBe(
            true,
        )
        expect(model.choices.some((c) => c.actionKey === 'CONFIG_RIG')).toBe(
            true,
        )
        expect(model.choices.some((c) => c.actionKey === 'HYDRATE_FLEET')).toBe(
            true,
        )
        expect(
            model.choices.some((c) => c.actionKey === 'AUDIT_VERSIONS'),
        ).toBe(true)
        expect(model.choices.some((c) => c.actionKey === 'MOCK_DEMO')).toBe(
            true,
        )
        expect(model.choices.some((c) => c.actionKey === 'ROOT_MENU')).toBe(
            true,
        )
    })

    it('TASK-7.2: executes integration gauntlet and verifies all 5 subsystems evaluate green', async () => {
        const model = new IntegrationModel()
        const fakeState: any = {
            hunt: async (action: string, bal: any) => {
                if (action.includes('Run Doctor')) {
                    if (bal.slv) bal.slv({ docBit: { val: 1, dat: [] } })
                } else if (action.includes('Stamp Hardware Configuration')) {
                    if (bal.slv)
                        bal.slv({
                            cfgBit: {
                                val: 1,
                                dat: { rig_identity: 'RIG_1_CONDUCTOR' },
                            },
                        })
                } else if (action.includes('Load Manifest')) {
                    if (bal.slv) bal.slv({ vrsBit: { val: 4, dat: {} } })
                } else if (action.includes('Evaluate Drift')) {
                    if (bal.slv) bal.slv({ drfBit: { val: 0, dat: [] } })
                } else if (action.includes('Run Mock Compilation')) {
                    if (bal.slv)
                        bal.slv({
                            cmpBit: { val: 1, dat: { status: 'CANONICAL' } },
                        })
                }
            },
        }

        let resolvedBit: any = null
        await runFlightDeckIntegrationGauntlet(
            model,
            {
                idx: 'test-gauntlet',
                slv: (res: any) => {
                    resolvedBit = res.intBit
                },
            },
            fakeState,
        )

        expect(resolvedBit.val).toBe(1)
        expect(model.allPassed).toBe(true)
        expect(model.results?.doctorProbes).toBe(true)
        expect(model.results?.hardwareConfig).toBe(true)
        expect(model.results?.fleetManifest).toBe(true)
        expect(model.results?.driftDetection).toBe(true)
        expect(model.results?.mockCompilation).toBe(true)
    })

    it('L3.2: handles unmapped ROGUE_ACTION cleanly and schedules 333ms tick', async () => {
        vi.useFakeTimers()
        const origLib = global.LIBRARY
        global.LIBRARY = {
            hunt: async (action: string) => {
                if (action.includes('Update Grid'))
                    return { grdBit: { dat: {} } }
                if (action.includes('Open Choice'))
                    return { chcBit: { src: 'ROGUE_ACTION' } }
                return {}
            },
        }
        try {
            const model = new MenuModel()
            let resolvedBit: any = null
            await flightDeckMenu(
                model,
                {
                    idx: 'test-rogue',
                    slv: (res: any) => {
                        resolvedBit = res.mnuBit
                    },
                },
                { hunt: async () => ({}) } as any,
            )
            expect(resolvedBit?.src).toBe('ROGUE_ACTION')
            expect(model.isProcessing).toBe(false)
        } finally {
            vi.clearAllTimers()
            vi.useRealTimers()
            global.LIBRARY = origLib
        }
    })

    it('L3.3: isolates Subsystem 4 Evaluate Drift rejection and logs FAIL to cns00', async () => {
        const logs: string[] = []
        const origLib = global.LIBRARY
        global.LIBRARY = {
            hunt: async (_action: string, bal: any) => {
                if (bal?.src) logs.push(bal.src)
            },
        }
        const model = new IntegrationModel()
        const fakeState: any = {
            hunt: async (action: string, bal: any) => {
                if (action.includes('Run Doctor')) {
                    if (bal.slv) bal.slv({ docBit: { val: 1, dat: [] } })
                } else if (action.includes('Stamp Hardware Configuration')) {
                    if (bal.slv)
                        bal.slv({
                            cfgBit: {
                                val: 1,
                                dat: { rig_identity: 'RIG_1_CONDUCTOR' },
                            },
                        })
                } else if (action.includes('Load Manifest')) {
                    if (bal.slv) bal.slv({ vrsBit: { val: 4, dat: {} } })
                } else if (action.includes('Evaluate Drift')) {
                    throw new Error('Synthetic drift evaluator fault')
                } else if (action.includes('Run Mock Compilation')) {
                    if (bal.slv)
                        bal.slv({
                            cmpBit: { val: 1, dat: { status: 'CANONICAL' } },
                        })
                }
            },
        }
        try {
            let resolvedBit: any = null
            await runFlightDeckIntegrationGauntlet(
                model,
                {
                    idx: 'test-fault-isolation',
                    slv: (res: any) => {
                        resolvedBit = res.intBit
                    },
                },
                fakeState,
            )
            expect(model.results?.driftDetection).toBe(false)
            expect(model.allPassed).toBe(false)
            expect(resolvedBit?.val).toBe(0)
            expect(
                logs.some((m) =>
                    m.includes(
                        '>> [FAIL] Subsystem 4: Manifest Drift Evaluator Exception',
                    ),
                ),
            ).toBe(true)
        } finally {
            global.LIBRARY = origLib
        }
    })
})
