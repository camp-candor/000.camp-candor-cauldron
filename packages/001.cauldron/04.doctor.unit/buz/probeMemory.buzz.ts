import * as os from 'os'
import DoctorBit, { DiagnosticReportItem } from '../fce/doctor.bit.js'
import { DoctorModel } from '../doctor.model.js'
import State from '../../99.core/state.js'

export const probeMemory = (
    cpy: DoctorModel,
    bal: DoctorBit,
    ste: State,
): DoctorModel => {
    const totalBytes = os.totalmem()
    const totalGb = Math.round((totalBytes / (1024 * 1024 * 1024)) * 10) / 10
    const compliant = totalGb >= 8.0

    const result: DiagnosticReportItem = {
        id: 'viewport_ram',
        name: 'Headless Viewport Memory',
        status: compliant ? 'PASS' : 'WARN',
        details: `${totalGb} GB Total Host RAM (Recommended >= 8.0 GB)`,
    }

    if (bal.slv)
        bal.slv({
            docBit: {
                idx: 'probe-memory',
                val: compliant ? 1 : 0,
                dat: result,
            },
        })
    return cpy
}
