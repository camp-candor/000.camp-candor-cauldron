export interface FleetManifestRepo {
    cluster: string
    url: string
    ref: string
    roles?: string[]
}

export interface VersionsManifestPayload {
    manifest_version: string
    updated_at: string
    sovereign_repo: string
    repos: Record<string, FleetManifestRepo>
}

export default interface VersionsBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
