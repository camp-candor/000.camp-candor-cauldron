import DoctorBit, { DiagnosticReportItem } from '../fce/doctor.bit.js'
import { DoctorModel } from '../doctor.model.js'
import State from '../../99.core/state.js'
import { probeRuntime } from './probeRuntime.buzz.js'
import { probeQuantizer } from './probeQuantizer.buzz.js'
import { probeMemory } from './probeMemory.buzz.js'

export const runDoctor = async (
    cpy: DoctorModel,
    bal: DoctorBit,
    ste: State,
): Promise<DoctorModel> => {
    const reports: DiagnosticReportItem[] = []

    const logConsole = async (msg: string) => {
        if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
            try {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
            } catch {
                // Fallback for non-interactive runner
            }
        }
    }

    await logConsole(
        '>> [CAULDRON DOCTOR] Initiating pre-flight hardware probes...',
    )

    // 1. Probe Node.js Engine
    let r1: DiagnosticReportItem | null = null
    probeRuntime(
        cpy,
        {
            idx: 'p1',
            slv: (res: any) => {
                r1 = res?.docBit?.dat
            },
        },
        ste,
    )
    if (r1) {
        reports.push(r1)
        await logConsole(
            `>> [${(r1 as DiagnosticReportItem).status}] ${(r1 as DiagnosticReportItem).name}: ${(r1 as DiagnosticReportItem).details}`,
        )
    }

    // 2. Probe ffprobe Audio Quantizer
    let r2: DiagnosticReportItem | null = null
    probeQuantizer(
        cpy,
        {
            idx: 'p2',
            slv: (res: any) => {
                r2 = res?.docBit?.dat
            },
        },
        ste,
    )
    if (r2) {
        reports.push(r2)
        await logConsole(
            `>> [${(r2 as DiagnosticReportItem).status}] ${(r2 as DiagnosticReportItem).name}: ${(r2 as DiagnosticReportItem).details}`,
        )
    }

    // 3. Probe Host Memory
    let r3: DiagnosticReportItem | null = null
    probeMemory(
        cpy,
        {
            idx: 'p3',
            slv: (res: any) => {
                r3 = res?.docBit?.dat
            },
        },
        ste,
    )
    if (r3) {
        reports.push(r3)
        await logConsole(
            `>> [${(r3 as DiagnosticReportItem).status}] ${(r3 as DiagnosticReportItem).name}: ${(r3 as DiagnosticReportItem).details}`,
        )
    }

    const allPassed = reports.every((r) => r.status !== 'FAIL')
    cpy.lastRunPassed = allPassed
    cpy.reports = reports
    cpy.evaluatedAt = new Date().toISOString()

    await logConsole(
        `>> [CAULDRON DOCTOR] Pre-flight assessment complete: [${allPassed ? 'PASS' : 'FAIL'}]`,
    )

    if (bal.slv) {
        bal.slv({
            docBit: {
                idx: 'run-doctor',
                val: allPassed ? 1 : 0,
                dat: reports,
            },
        })
    }
    return cpy
}
