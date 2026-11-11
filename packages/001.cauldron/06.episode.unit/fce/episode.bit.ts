export interface DialogueAstLine {
    id: string
    speaker: string
    emotion: string
    text: string
    audio_stem: string
}

export interface DialogueAstPayload {
    scene_id: string
    location_id: string
    lines: DialogueAstLine[]
}

export default interface EpisodeBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
