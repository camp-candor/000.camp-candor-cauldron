import { DialogueAstPayload } from './fce/episode.bit.js'

export class EpisodeModel {
    idx: string = '06.episode.unit'
    lastValidatedAst: DialogueAstPayload | null = null
    isValid: boolean = false
    validatedAt: string = ''
}
