import * as fs from 'fs'
import * as path from 'path'
import VersionsBit, { VersionsManifestPayload } from '../fce/versions.bit.js'
import { VersionsModel } from '../versions.model.js'
import State from '../../99.core/state.js'

export const loadManifest = (
    cpy: VersionsModel,
    bal: VersionsBit,
    ste: State,
): VersionsModel => {
    const rootDir = bal.dat?.customRoot || process.cwd()
    const manifestPath = bal.src || path.join(rootDir, 'versions.json')

    if (!fs.existsSync(manifestPath)) {
        throw new Error(`versions.json manifest not found at ${manifestPath}`)
    }

    const raw = fs.readFileSync(manifestPath, 'utf8')
    let parsed: VersionsManifestPayload
    try {
        parsed = JSON.parse(raw)
    } catch (err: any) {
        if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
            try {
                void global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `:: [WARN] Corrupt versions.json manifest: ${err?.message || 'JSON syntax error'}`,
                })
            } catch {
                // Safe fallback
            }
        }
        throw new Error(
            `Corrupt versions.json manifest at ${manifestPath}: ${err?.message || 'JSON syntax error'}`,
        )
    }

    if (!parsed.manifest_version || !parsed.repos) {
        throw new Error('Malformed versions.json manifest payload')
    }

    cpy.manifestPath = manifestPath
    cpy.cachedManifest = parsed
    cpy.loadedAt = new Date().toISOString()

    if (bal.slv) {
        bal.slv({
            vrsBit: {
                idx: 'load-manifest',
                val: Object.keys(parsed.repos).length,
                dat: parsed,
            },
        })
    }
    return cpy
}
