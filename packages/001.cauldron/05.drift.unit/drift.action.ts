import { Action } from '../99.core/interface/action.interface'
import DriftBit from './fce/drift.bit'

// Drift actions

export const INIT_DRIFT = '[Drift action] Init Drift'
export class InitDrift implements Action {
    readonly type = INIT_DRIFT
    constructor(public bale: DriftBit) {}
}

export const UPDATE_DRIFT = '[Drift action] Update Drift'
export class UpdateDrift implements Action {
    readonly type = UPDATE_DRIFT
    constructor(public bale: DriftBit) {}
}

export const EVALUATE_DRIFT = '[Drift action] Evaluate Drift'
export class EvaluateDrift implements Action {
    readonly type = EVALUATE_DRIFT
    constructor(public bale: DriftBit) {}
}

export const RENDER_DRIFT_REPORT = '[Drift action] Render Drift Report'
export class RenderDriftReport implements Action {
    readonly type = RENDER_DRIFT_REPORT
    constructor(public bale: DriftBit) {}
}

export type Actions =
    InitDrift | UpdateDrift | EvaluateDrift | RenderDriftReport
