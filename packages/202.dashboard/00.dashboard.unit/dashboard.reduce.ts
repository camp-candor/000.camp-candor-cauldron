import clone from 'clone-deep'
import * as Act from './dashboard.action.js'
import { DashboardModel } from './dashboard.model.js'
import * as Buzz from './dashboard.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: DashboardModel = new DashboardModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_DASHBOARD:
            return Buzz.updateDashboard(clone(model), act.bale, state)

        case Act.INIT_DASHBOARD:
            return Buzz.initDashboard(clone(model), act.bale, state)

        case Act.TEST_DASHBOARD:
            return Buzz.testDashboard(clone(model), act.bale, state)

        case Act.LIST_DASHBOARD:
            return Buzz.listDashboard(clone(model), act.bale, state)

        default:
            return model
    }
}
