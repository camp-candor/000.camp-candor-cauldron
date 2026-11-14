import clone from 'clone-deep'
import * as Act from './drift.action'
import { DriftModel } from './drift.model'
import * as Buzz from './drift.buzzer'
import State from '../99.core/state'

export function reducer(
    model: DriftModel = new DriftModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_DRIFT:
            return Buzz.updateDrift(clone(model), act.bale, state)

        case Act.INIT_DRIFT:
            return Buzz.initDrift(clone(model), act.bale, state)

        case Act.EVALUATE_DRIFT:
            return Buzz.evaluateDrift(clone(model), act.bale, state)

        case Act.RENDER_DRIFT_REPORT:
            return Buzz.renderDriftReport(clone(model), act.bale, state)

        default:
            return model
    }
}
