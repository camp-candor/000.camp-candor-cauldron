import clone from 'clone-deep'
import * as Act from './config.action'
import { ConfigModel } from './config.model'
import * as Buzz from './config.buzzer'
import State from '../99.core/state'

export function reducer(
    model: ConfigModel = new ConfigModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CONFIG:
            return Buzz.updateConfig(clone(model), act.bale, state)

        case Act.INIT_CONFIG:
            return Buzz.initConfig(clone(model), act.bale, state)

        default:
            return model
    }
}
