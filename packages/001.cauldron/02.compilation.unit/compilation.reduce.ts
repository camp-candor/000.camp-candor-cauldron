import clone from 'clone-deep'
import * as Act from './compilation.action'
import { CompilationModel } from './compilation.model'
import * as Buzz from './compilation.buzzer'
import State from '../99.core/state'

export function reducer(
    model: CompilationModel = new CompilationModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_COMPILATION:
            return Buzz.updateCompilation(clone(model), act.bale, state)

        case Act.INIT_COMPILATION:
            return Buzz.initCompilation(clone(model), act.bale, state)

        case Act.RUN_MOCK_COMPILATION:
            return Buzz.runMockCompilation(clone(model), act.bale, state)

        default:
            return model
    }
}
