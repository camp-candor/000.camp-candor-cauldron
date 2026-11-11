export interface MockCompilationSummary {
    status: 'CANONICAL' | 'FAILED'
    totalFrames: number
    durationMs: number
    renderedFile: string
    cloudCost: string
}

export default interface CompilationBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
