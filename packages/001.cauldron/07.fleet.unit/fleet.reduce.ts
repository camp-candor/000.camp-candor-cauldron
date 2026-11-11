import clone from 'clone-deep'
import * as Act from './fleet.action'
import { FleetModel } from './fleet.model'
import * as Buzz from './fleet.buzzer'
import State from '../99.core/state'

export function reducer(
    model: FleetModel = new FleetModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_FLEET:
            return Buzz.updateFleet(clone(model), act.bale, state)

        case Act.INIT_FLEET:
            return Buzz.initFleet(clone(model), act.bale, state)

        default:
            return model
    }
}
