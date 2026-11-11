import { Action } from '../99.core/interface/action.interface'
import HardwareBit from './fce/hardware.bit'

// Hardware actions

export const INIT_HARDWARE = '[Hardware action] Init Hardware'
export class InitHardware implements Action {
    readonly type = INIT_HARDWARE
    constructor(public bale: HardwareBit) {}
}

export const UPDATE_HARDWARE = '[Hardware action] Update Hardware'
export class UpdateHardware implements Action {
    readonly type = UPDATE_HARDWARE
    constructor(public bale: HardwareBit) {}
}

export type Actions = InitHardware | UpdateHardware
