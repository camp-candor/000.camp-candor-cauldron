import clone from 'clone-deep'
import * as Act from './doctor.action'
import { DoctorModel } from './doctor.model'
import * as Buzz from './doctor.buzzer'
import State from '../99.core/state'

export function reducer(
    model: DoctorModel = new DoctorModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_DOCTOR:
            return Buzz.updateDoctor(clone(model), act.bale, state)

        case Act.INIT_DOCTOR:
            return Buzz.initDoctor(clone(model), act.bale, state)

        default:
            return model
    }
}
