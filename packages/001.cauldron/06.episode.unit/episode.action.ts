import { Action } from '../99.core/interface/action.interface'
import EpisodeBit from './fce/episode.bit'

// Episode actions

export const INIT_EPISODE = '[Episode action] Init Episode'
export class InitEpisode implements Action {
    readonly type = INIT_EPISODE
    constructor(public bale: EpisodeBit) {}
}

export const UPDATE_EPISODE = '[Episode action] Update Episode'
export class UpdateEpisode implements Action {
    readonly type = UPDATE_EPISODE
    constructor(public bale: EpisodeBit) {}
}

export const VALIDATE_DIALOGUE_AST = '[Episode action] Validate Dialogue Ast'
export class ValidateDialogueAst implements Action {
    readonly type = VALIDATE_DIALOGUE_AST
    constructor(public bale: EpisodeBit) {}
}

export type Actions = InitEpisode | UpdateEpisode | ValidateDialogueAst
