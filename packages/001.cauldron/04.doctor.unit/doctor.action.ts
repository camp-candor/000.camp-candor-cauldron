import { Action } from '../99.core/interface/action.interface'
import DoctorBit from './fce/doctor.bit'

// Doctor actions

export const INIT_DOCTOR = '[Doctor action] Init Doctor'
export class InitDoctor implements Action {
    readonly type = INIT_DOCTOR
    constructor(public bale: DoctorBit) {}
}

export const UPDATE_DOCTOR = '[Doctor action] Update Doctor'
export class UpdateDoctor implements Action {
    readonly type = UPDATE_DOCTOR
    constructor(public bale: DoctorBit) {}
}

export const RUN_DOCTOR = '[Doctor action] Run Doctor'
export class RunDoctor implements Action {
    readonly type = RUN_DOCTOR
    constructor(public bale: DoctorBit) {}
}

export type Actions = InitDoctor | UpdateDoctor | RunDoctor
