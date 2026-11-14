import clone from 'clone-deep'
import * as Act from './episode.action'
import { EpisodeModel } from './episode.model'
import * as Buzz from './episode.buzzer'
import State from '../99.core/state'

export function reducer(
    model: EpisodeModel = new EpisodeModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_EPISODE:
            return Buzz.updateEpisode(clone(model), act.bale, state)

        case Act.INIT_EPISODE:
            return Buzz.initEpisode(clone(model), act.bale, state)

        case Act.VALIDATE_DIALOGUE_AST:
            return Buzz.validateDialogueAst(clone(model), act.bale, state)

        default:
            return model
    }
}
