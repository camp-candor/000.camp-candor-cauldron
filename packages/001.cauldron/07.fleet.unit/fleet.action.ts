import { Action } from '../99.core/interface/action.interface'
import FleetBit from './fce/fleet.bit'

// Fleet actions

export const INIT_FLEET = '[Fleet action] Init Fleet'
export class InitFleet implements Action {
    readonly type = INIT_FLEET
    constructor(public bale: FleetBit) {}
}

export const UPDATE_FLEET = '[Fleet action] Update Fleet'
export class UpdateFleet implements Action {
    readonly type = UPDATE_FLEET
    constructor(public bale: FleetBit) {}
}

export const HYDRATE_FLEET = '[Fleet action] Hydrate Fleet'
export class HydrateFleet implements Action {
    readonly type = HYDRATE_FLEET
    constructor(public bale: FleetBit) {}
}

export const STAMP_TOMBSTONE = '[Fleet action] Stamp Tombstone'
export class StampTombstone implements Action {
    readonly type = STAMP_TOMBSTONE
    constructor(public bale: FleetBit) {}
}

export type Actions = InitFleet | UpdateFleet | HydrateFleet | StampTombstone
