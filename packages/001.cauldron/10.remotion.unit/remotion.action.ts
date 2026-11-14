import { Action } from '../99.core/interface/action.interface'
import RemotionBit from './fce/remotion.bit'

// Remotion actions

export const INIT_REMOTION = '[Remotion action] Init Remotion'
export class InitRemotion implements Action {
    readonly type = INIT_REMOTION
    constructor(public bale: RemotionBit) {}
}

export const UPDATE_REMOTION = '[Remotion action] Update Remotion'
export class UpdateRemotion implements Action {
    readonly type = UPDATE_REMOTION
    constructor(public bale: RemotionBit) {}
}

export const BUILD_REMOTION_ROOT = '[Remotion action] Build Remotion Root'
export class BuildRemotionRoot implements Action {
    readonly type = BUILD_REMOTION_ROOT
    constructor(public bale: RemotionBit) {}
}

export type Actions = InitRemotion | UpdateRemotion | BuildRemotionRoot
