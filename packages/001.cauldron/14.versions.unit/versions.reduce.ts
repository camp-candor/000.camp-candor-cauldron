import clone from 'clone-deep'
import * as Act from './versions.action'
import { VersionsModel } from './versions.model'
import * as Buzz from './versions.buzzer'
import State from '../99.core/state'

export function reducer(
    model: VersionsModel = new VersionsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_VERSIONS:
            return Buzz.updateVersions(clone(model), act.bale, state)

        case Act.INIT_VERSIONS:
            return Buzz.initVersions(clone(model), act.bale, state)

        default:
            return model
    }
}
