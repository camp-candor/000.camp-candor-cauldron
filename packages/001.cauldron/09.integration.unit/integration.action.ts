import { Action } from '../99.core/interface/action.interface'
import IntegrationBit from './fce/integration.bit'

// Integration actions

export const INIT_INTEGRATION = '[Integration action] Init Integration'
export class InitIntegration implements Action {
    readonly type = INIT_INTEGRATION
    constructor(public bale: IntegrationBit) {}
}

export const UPDATE_INTEGRATION = '[Integration action] Update Integration'
export class UpdateIntegration implements Action {
    readonly type = UPDATE_INTEGRATION
    constructor(public bale: IntegrationBit) {}
}

export type Actions = InitIntegration | UpdateIntegration
