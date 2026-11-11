import DriftBit, { RepoDriftRecord } from '../fce/drift.bit.js'
import { DriftModel } from '../drift.model.js'
import State from '../../99.core/state.js'
import { evaluateDrift } from './driftEvaluator.buzz.js'

export const renderDriftReport = async (
    cpy: DriftModel,
    bal: DriftBit,
    ste: State,
): Promise<DriftModel> => {
    let records: RepoDriftRecord[] = []
    evaluateDrift(
        cpy,
        {
            idx: 'eval-internal',
            src: bal.src,
            dat: bal.dat,
            slv: (res: any) => {
                records = res.drfBit.dat
            },
        },
        ste,
    )

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
    await logConsole('>> LOCAL FLEET DRIFT AUDIT REPORT (versions.json)')
    await logConsole(
        '>> ==============================================================',
    )

    for (const r of records) {
        const statusTag = `[${r.status.padEnd(7)}]`
        const repoLabel = `${r.cluster}/${r.repo}`.padEnd(32)
        const expLabel = `Exp: ${r.expected.slice(0, 7)}`.padEnd(12)
        const actLabel = `Act: ${r.actual.slice(0, 7)}`
        await logConsole(`>> ${statusTag} ${repoLabel} ${expLabel} ${actLabel}`)
    }

    await logConsole(
        '>> ==============================================================',
    )
    await logConsole(
        `>> [DRIFT REPORT] Total Inspected: ${records.length} | Fleet In Sync: ${!cpy.hasDrift}`,
    )

    if (bal.slv) {
        bal.slv({
            drfBit: {
                idx: 'render-drift-report',
                val: cpy.hasDrift ? 1 : 0,
                dat: records,
            },
        })
    }
    return cpy
}
