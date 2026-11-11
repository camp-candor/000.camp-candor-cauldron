import DoctorBit, { DiagnosticReportItem } from '../fce/doctor.bit.js'
import { DoctorModel } from '../doctor.model.js'
import State from '../../99.core/state.js'

export const probeRuntime = (
    cpy: DoctorModel,
    bal: DoctorBit,
    ste: State,
): DoctorModel => {
    const version = process.version
    const major = parseInt(version.replace('v', '').split('.')[0], 10)
    const passed = major >= 20

    const result: DiagnosticReportItem = {
        id: 'node_runtime',
        name: 'Node.js Engine',
        status: passed ? 'PASS' : 'FAIL',
        details: `${version} (Requires Node.js >= v20.0.0)`,
    }

    if (bal.slv)
        bal.slv({
            docBit: { idx: 'probe-runtime', val: passed ? 1 : 0, dat: result },
        })
    return cpy
}
