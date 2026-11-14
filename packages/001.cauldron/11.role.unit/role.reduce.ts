import clone from 'clone-deep'
import * as Act from './role.action'
import { RoleModel } from './role.model'
import * as Buzz from './role.buzzer'
import State from '../99.core/state'

export function reducer(
    model: RoleModel = new RoleModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_ROLE:
            return Buzz.updateRole(clone(model), act.bale, state)

        case Act.INIT_ROLE:
            return Buzz.initRole(clone(model), act.bale, state)

        case Act.SELECT_ROLE:
            return Buzz.selectContributorRole(clone(model), act.bale, state)

        default:
            return model
    }
}
