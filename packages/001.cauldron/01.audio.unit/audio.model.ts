import { AudioQuantizationReceipt } from './fce/audio.bit.js'

export class AudioModel {
    idx: string = '01.audio.unit'
    lastQuantization: AudioQuantizationReceipt | null = null
    history: AudioQuantizationReceipt[] = []
}
