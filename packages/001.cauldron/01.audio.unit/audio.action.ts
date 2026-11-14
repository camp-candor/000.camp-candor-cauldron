import { Action } from '../99.core/interface/action.interface'
import AudioBit from './fce/audio.bit'

// Audio actions

export const INIT_AUDIO = '[Audio action] Init Audio'
export class InitAudio implements Action {
    readonly type = INIT_AUDIO
    constructor(public bale: AudioBit) {}
}

export const UPDATE_AUDIO = '[Audio action] Update Audio'
export class UpdateAudio implements Action {
    readonly type = UPDATE_AUDIO
    constructor(public bale: AudioBit) {}
}

export const QUANTIZE_DURATION = '[Audio action] Quantize Duration'
export class QuantizeDuration implements Action {
    readonly type = QUANTIZE_DURATION
    constructor(public bale: AudioBit) {}
}

export type Actions = InitAudio | UpdateAudio | QuantizeDuration
