import { VersionsManifestPayload } from './fce/versions.bit.js'

export class VersionsModel {
    idx: string = '14.versions.unit'
    manifestPath: string = ''
    cachedManifest: VersionsManifestPayload | null = null
    loadedAt: string = ''
}
