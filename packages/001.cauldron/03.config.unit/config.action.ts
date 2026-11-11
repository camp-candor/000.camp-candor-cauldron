import { Action } from '../99.core/interface/action.interface'
import ConfigBit from './fce/config.bit'

// Config actions

export const INIT_CONFIG = '[Config action] Init Config'
export class InitConfig implements Action {
    readonly type = INIT_CONFIG
    constructor(public bale: ConfigBit) {}
}

export const UPDATE_CONFIG = '[Config action] Update Config'
export class UpdateConfig implements Action {
    readonly type = UPDATE_CONFIG
    constructor(public bale: ConfigBit) {}
}

export type Actions = InitConfig | UpdateConfig
