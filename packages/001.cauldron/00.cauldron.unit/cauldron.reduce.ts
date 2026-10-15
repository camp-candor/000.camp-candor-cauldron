import clone from 'clone-deep'
import * as Act from './cauldron.action.js'
import { CauldronModel } from './cauldron.model.js'
import * as Buzz from './cauldron.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: CauldronModel = new CauldronModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CAULDRON:
            return Buzz.updateCauldron(clone(model), act.bale, state)

        case Act.INIT_CAULDRON:
            return Buzz.initCauldron(clone(model), act.bale, state)

        case Act.TEST_CAULDRON:
            return Buzz.testCauldron(clone(model), act.bale, state)

        case Act.LIST_CAULDRON:
            return Buzz.listCauldron(clone(model), act.bale, state)

        default:
            return model
    }
}
