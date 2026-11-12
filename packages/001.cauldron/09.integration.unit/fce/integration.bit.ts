export interface SubsystemValidationResult {
    doctorProbes: boolean
    hardwareConfig: boolean
    fleetManifest: boolean
    driftDetection: boolean
    mockCompilation: boolean
}

export default interface IntegrationBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
