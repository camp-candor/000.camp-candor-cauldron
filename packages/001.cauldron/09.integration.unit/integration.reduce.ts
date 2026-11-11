import clone from 'clone-deep'
import * as Act from './integration.action'
import { IntegrationModel } from './integration.model'
import * as Buzz from './integration.buzzer'
import State from '../99.core/state'

export function reducer(
    model: IntegrationModel = new IntegrationModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_INTEGRATION:
            return Buzz.updateIntegration(clone(model), act.bale, state)

        case Act.INIT_INTEGRATION:
            return Buzz.initIntegration(clone(model), act.bale, state)

        default:
            return model
    }
}
