import IntegrationBit, {
    SubsystemValidationResult,
} from '../fce/integration.bit.js'
import { IntegrationModel } from '../integration.model.js'
import State from '../../99.core/state.js'

export const runFlightDeckIntegrationGauntlet = async (
    cpy: IntegrationModel,
    bal: IntegrationBit,
    ste: State,
): Promise<IntegrationModel> => {
    const results: SubsystemValidationResult = {
        doctorProbes: false,
        hardwareConfig: false,
        fleetManifest: false,
        driftDetection: false,
        mockCompilation: false,
    }

    const logConsole = async (msg: string) => {
        if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
            try {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
            } catch {
                // Fallback for non-interactive runners
            }
        }
    }

    await logConsole(
        '>> ==============================================================',
    )
    await logConsole(
        '>> [GAUNTLET] Initiating Full Day 002 Integration Battery...',
    )
    await logConsole(
        '>> ==============================================================',
    )

    // 1. Verify Doctor Diagnostic Probes
    try {
        let docRes: any
        await ste.hunt('[Doctor action] Run Doctor', {
            slv: (r: any) => {
                docRes = r
            },
        })
        results.doctorProbes =
            docRes?.docBit?.val === 1 || Array.isArray(docRes?.docBit?.dat)
        await logConsole(
            `>> [${results.doctorProbes ? 'PASS' : 'FAIL'}] Subsystem 1: Host Diagnostics`,
        )
    } catch {
        results.doctorProbes = false
        await logConsole('>> [FAIL] Subsystem 1: Host Diagnostics Exception')
    }

    // 2. Verify Hardware Configuration Serialization
    try {
        let cfgRes: any
        await ste.hunt('[Config action] Stamp Hardware Configuration', {
            src: 'RIG_1_CONDUCTOR',
            slv: (r: any) => {
                cfgRes = r
            },
        })
        results.hardwareConfig =
            cfgRes?.cfgBit?.val === 1 &&
            cfgRes?.cfgBit?.dat?.rig_identity === 'RIG_1_CONDUCTOR'
        await logConsole(
            `>> [${results.hardwareConfig ? 'PASS' : 'FAIL'}] Subsystem 2: Hardware Configuration`,
        )
    } catch {
        results.hardwareConfig = false
        await logConsole(
            '>> [FAIL] Subsystem 2: Hardware Configuration Exception',
        )
    }

    // 3. Verify Fleet Manifest Loading
    try {
        let vrsRes: any
        await ste.hunt('[Versions action] Load Manifest', {
            slv: (r: any) => {
                vrsRes = r
            },
        })
        results.fleetManifest = vrsRes?.vrsBit?.val > 0
        await logConsole(
            `>> [${results.fleetManifest ? 'PASS' : 'FAIL'}] Subsystem 3: Fleet Manifest Ingestion`,
        )
    } catch {
        results.fleetManifest = false
        await logConsole('>> [FAIL] Subsystem 3: Fleet Manifest Exception')
    }

    // 4. Verify Local Drift Detection
    try {
        let drfRes: any
        await ste.hunt('[Drift action] Evaluate Drift', {
            slv: (r: any) => {
                drfRes = r
            },
        })
        results.driftDetection = Array.isArray(drfRes?.drfBit?.dat)
        await logConsole(
            `>> [${results.driftDetection ? 'PASS' : 'FAIL'}] Subsystem 4: Manifest Drift Evaluator`,
        )
    } catch {
        results.driftDetection = false
        await logConsole(
            '>> [FAIL] Subsystem 4: Manifest Drift Evaluator Exception',
        )
    }

    // 5. Verify Zero-Cost Mock Compilation Dry Run
    try {
        let cmpRes: any
        await ste.hunt('[Compilation action] Run Mock Compilation', {
            dat: { dryRun: true },
            slv: (r: any) => {
                cmpRes = r
            },
        })
        results.mockCompilation =
            cmpRes?.cmpBit?.val === 1 &&
            cmpRes?.cmpBit?.dat?.status === 'CANONICAL'
        await logConsole(
            `>> [${results.mockCompilation ? 'PASS' : 'FAIL'}] Subsystem 5: Zero-Cost Mock Compilation`,
        )
    } catch {
        results.mockCompilation = false
        await logConsole(
            '>> [FAIL] Subsystem 5: Zero-Cost Mock Compilation Exception',
        )
    }

    const allPassed = Object.values(results).every(Boolean)
    cpy.allPassed = allPassed
    cpy.results = results
    cpy.executedAt = new Date().toISOString()

    await logConsole(
        '>> ==============================================================',
    )
    await logConsole(
        `>> [GAUNTLET COMPLETE] Verdict: [${allPassed ? 'ALL SUBSYSTEMS GREEN' : 'VERIFICATION BREACH'}]`,
    )
    await logConsole(
        '>> ==============================================================',
    )

    if (bal.slv) {
        bal.slv({
            intBit: {
                idx: 'run-gauntlet',
                val: allPassed ? 1 : 0,
                dat: results,
            },
        })
    }
    return cpy
}
