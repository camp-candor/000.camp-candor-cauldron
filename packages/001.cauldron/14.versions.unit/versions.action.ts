import { Action } from '../99.core/interface/action.interface'
import VersionsBit from './fce/versions.bit'

// Versions actions

export const INIT_VERSIONS = '[Versions action] Init Versions'
export class InitVersions implements Action {
    readonly type = INIT_VERSIONS
    constructor(public bale: VersionsBit) {}
}

export const UPDATE_VERSIONS = '[Versions action] Update Versions'
export class UpdateVersions implements Action {
    readonly type = UPDATE_VERSIONS
    constructor(public bale: VersionsBit) {}
}

export type Actions = InitVersions | UpdateVersions
