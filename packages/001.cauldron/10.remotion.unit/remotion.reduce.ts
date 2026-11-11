import clone from 'clone-deep'
import * as Act from './remotion.action'
import { RemotionModel } from './remotion.model'
import * as Buzz from './remotion.buzzer'
import State from '../99.core/state'

export function reducer(
    model: RemotionModel = new RemotionModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_REMOTION:
            return Buzz.updateRemotion(clone(model), act.bale, state)

        case Act.INIT_REMOTION:
            return Buzz.initRemotion(clone(model), act.bale, state)

        default:
            return model
    }
}
