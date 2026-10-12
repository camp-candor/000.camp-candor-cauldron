import { Action } from '../99.core/interface/action.interface.js'
import DashboardBit from './fce/dashboard.bit.js'

// dashboard actions

export const INIT_DASHBOARD = '[Dashboard action] Init Dashboard'
export class InitDashboard implements Action {
    readonly type = INIT_DASHBOARD
    constructor(public bale: DashboardBit) {}
}

export const UPDATE_DASHBOARD = '[Dashboard action] Update Dashboard'
export class UpdateDashboard implements Action {
    readonly type = UPDATE_DASHBOARD
    constructor(public bale: DashboardBit) {}
}

export const TEST_DASHBOARD = '[Test action] Test Dashboard'
export class TestDashboard implements Action {
    readonly type = TEST_DASHBOARD
    constructor(public bale: DashboardBit) {}
}

export const INTELLECT_DASHBOARD = '[Intellect action] Intellect Dashboard'
export class IntellectDashboard implements Action {
    readonly type = INTELLECT_DASHBOARD
    constructor(public bale: DashboardBit) {}
}

export const VISION_DASHBOARD = '[Vision action] Vision Dashboard'
export class VisionDashboard implements Action {
    readonly type = VISION_DASHBOARD
    constructor(public bale: DashboardBit) {}
}

export const LIST_DASHBOARD = '[List action] List Dashboard'
export class ListDashboard implements Action {
    readonly type = LIST_DASHBOARD
    constructor(public bale: DashboardBit) {}
}

export type Actions =
    | InitDashboard
    | UpdateDashboard
    | TestDashboard
    | IntellectDashboard
    | VisionDashboard
    | ListDashboard
