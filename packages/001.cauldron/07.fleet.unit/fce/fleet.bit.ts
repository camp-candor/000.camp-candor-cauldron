export interface FleetManifestRepoEntry {
    cluster: string
    url: string
    ref: string
    roles: string[]
}

export interface FleetManifest {
    manifest_version: string
    updated_at: string
    sovereign_repo: string
    repos: Record<string, FleetManifestRepoEntry>
}

export default interface FleetBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
