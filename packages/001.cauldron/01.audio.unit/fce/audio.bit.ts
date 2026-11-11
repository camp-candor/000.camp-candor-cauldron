export interface AudioQuantizationReceipt {
    filePath: string
    durationSec: number
    durationMs: number
    totalFrames: number
    fps: number
    sha256: string
}

export default interface AudioBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
