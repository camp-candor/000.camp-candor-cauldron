export type RigIdentityType = 'RIG_1_CONDUCTOR' | 'RIG_2_FOUNDRY'

export interface HardwareProfileData {
    rig_identity: RigIdentityType
    audio_port: number
    gpu_acceleration: boolean
    max_memory_concurrency: number
    timestamp: string
}

export default interface HardwareBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        rig_identity?: RigIdentityType
        label?: string
        profile?: HardwareProfileData
    }
    slv?: Function
}
