import clone from 'clone-deep'
import * as Act from './hardware.action'
import { HardwareModel } from './hardware.model'
import * as Buzz from './hardware.buzzer'
import State from '../99.core/state'

export function reducer(
    model: HardwareModel = new HardwareModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_HARDWARE:
            return Buzz.updateHardware(clone(model), act.bale, state)

        case Act.INIT_HARDWARE:
            return Buzz.initHardware(clone(model), act.bale, state)

        default:
            return model
    }
}
