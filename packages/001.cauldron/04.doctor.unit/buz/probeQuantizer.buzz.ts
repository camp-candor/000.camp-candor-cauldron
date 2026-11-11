import { execSync } from 'child_process'
import DoctorBit, { DiagnosticReportItem } from '../fce/doctor.bit.js'
import { DoctorModel } from '../doctor.model.js'
import State from '../../99.core/state.js'

export const probeQuantizer = (
    cpy: DoctorModel,
    bal: DoctorBit,
    ste: State,
): DoctorModel => {
    let passed = false
    let details = 'ffprobe binary missing from host PATH'

    try {
        const stdout = execSync('ffprobe -version', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
            timeout: 3000,
        })
        details = stdout
            .split('\n')[0]
            .replace(/[^\x20-\x7E]/g, '')
            .trim()
        passed = true
    } catch {
        passed = false
    }

    const result: DiagnosticReportItem = {
        id: 'acoustic_quantizer',
        name: 'ffprobe Frame Quantizer',
        status: passed ? 'PASS' : 'WARN',
        details,
    }

    if (bal.slv)
        bal.slv({
            docBit: {
                idx: 'probe-quantizer',
                val: passed ? 1 : 0,
                dat: result,
            },
        })
    return cpy
}
