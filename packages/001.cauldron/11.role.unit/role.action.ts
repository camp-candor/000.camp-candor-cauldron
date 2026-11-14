import { Action } from '../99.core/interface/action.interface'
import RoleBit from './fce/role.bit'

// Role actions

export const INIT_ROLE = '[Role action] Init Role'
export class InitRole implements Action {
    readonly type = INIT_ROLE
    constructor(public bale: RoleBit) {}
}

export const UPDATE_ROLE = '[Role action] Update Role'
export class UpdateRole implements Action {
    readonly type = UPDATE_ROLE
    constructor(public bale: RoleBit) {}
}

export const SELECT_ROLE = '[Role action] Select Role'
export class SelectRole implements Action {
    readonly type = SELECT_ROLE
    constructor(public bale: RoleBit) {}
}

export type Actions = InitRole | UpdateRole | SelectRole
