import { describe, it, expect } from 'vitest'
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
})
