import { Action } from '../99.core/interface/action.interface.js'
import CauldronBit from './fce/cauldron.bit.js'

// cauldron actions

export const INIT_CAULDRON = '[Cauldron action] Init Cauldron'
export class InitCauldron implements Action {
    readonly type = INIT_CAULDRON
    constructor(public bale: CauldronBit) {}
}

export const UPDATE_CAULDRON = '[Cauldron action] Update Cauldron'
export class UpdateCauldron implements Action {
    readonly type = UPDATE_CAULDRON
    constructor(public bale: CauldronBit) {}
}

export const TEST_CAULDRON = '[Test action] Test Cauldron'
export class TestCauldron implements Action {
    readonly type = TEST_CAULDRON
    constructor(public bale: CauldronBit) {}
}

export const INTELLECT_CAULDRON = '[Intellect action] Intellect Cauldron'
export class IntellectCauldron implements Action {
    readonly type = INTELLECT_CAULDRON
    constructor(public bale: CauldronBit) {}
}

export const VISION_CAULDRON = '[Vision action] Vision Cauldron'
export class VisionCauldron implements Action {
    readonly type = VISION_CAULDRON
    constructor(public bale: CauldronBit) {}
}

export const LIST_CAULDRON = '[List action] List Cauldron'
export class ListCauldron implements Action {
    readonly type = LIST_CAULDRON
    constructor(public bale: CauldronBit) {}
}

export type Actions =
    | InitCauldron
    | UpdateCauldron
    | TestCauldron
    | IntellectCauldron
    | VisionCauldron
    | ListCauldron
