export const initDoctor = (cpy: DoctorModel, bal: DoctorBit, ste: State) => {
    if (bal && bal.slv != null) {
        bal.slv({ docBit: { idx: 'init-doctor' } })
    }
    return cpy
}

export const updateDoctor = (cpy: DoctorModel, bal: DoctorBit, ste: State) => {
    if (bal && bal.slv != null) {
        bal.slv({ docBit: { idx: 'update-doctor' } })
    }
    return cpy
}

import { DoctorModel } from '../doctor.model'
import DoctorBit from '../fce/doctor.bit'
import State from '../../99.core/state'
