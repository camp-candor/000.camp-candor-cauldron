export interface CauldronConfigFile {
    rig_identity: 'RIG_1_CONDUCTOR' | 'RIG_2_FOUNDRY'
    audio_port: number
    gpu_acceleration: boolean
    max_memory_concurrency: number
    updated_at: string
}

export default interface ConfigBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
