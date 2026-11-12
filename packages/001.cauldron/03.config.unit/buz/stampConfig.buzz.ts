import * as fs from 'fs'
import * as path from 'path'
import ConfigBit, { CauldronConfigFile } from '../fce/config.bit.js'
import { ConfigModel } from '../config.model.js'
import State from '../../99.core/state.js'

// Resolve the monorepo studio root deterministically: npm workspace scripts
// execute with the workspace directory as cwd, so the serialized studio
// configuration must walk up to the repository root (package.json with
// workspaces declaration or .git anchor) before stamping to disk.
const resolveStudioRoot = (): string => {
    let curr = process.cwd()
    while (curr && curr !== path.dirname(curr)) {
        const pkgPath = path.join(curr, 'package.json')
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
                if (pkg.workspaces || fs.existsSync(path.join(curr, '.git'))) {
                    return curr
                }
            } catch {
                // Ignore malformed package manifests during root resolution
            }
        }
        curr = path.dirname(curr)
    }
    return process.cwd()
}

export const stampHardwareConfiguration = async (
    cpy: ConfigModel,
    bal: ConfigBit,
    ste: State,
): Promise<ConfigModel> => {
    const rigProfile = (bal.src || 'RIG_1_CONDUCTOR').toUpperCase()
    const isFoundry =
        rigProfile.includes('RIG_2') || rigProfile.includes('FOUNDRY')
    const targetRig = isFoundry ? 'RIG_2_FOUNDRY' : 'RIG_1_CONDUCTOR'

    const rootDir = bal.dat?.customRoot || resolveStudioRoot()
    const targetPath = path.join(rootDir, 'cauldron.config.json')
    const tempPath = path.join(rootDir, 'cauldron.config.json.tmp')

    const configPayload: CauldronConfigFile = {
        rig_identity: targetRig,
        audio_port: targetRig === 'RIG_1_CONDUCTOR' ? 8000 : 8001,
        gpu_acceleration: targetRig === 'RIG_2_FOUNDRY',
        max_memory_concurrency: targetRig === 'RIG_2_FOUNDRY' ? 4 : 1,
        updated_at: new Date().toISOString(),
    }

    // Atomic POSIX write: stage to .tmp first then atomic rename
    fs.writeFileSync(tempPath, JSON.stringify(configPayload, null, 2), {
        encoding: 'utf8',
    })
    fs.renameSync(tempPath, targetPath)

    cpy.lastStampedConfig = configPayload

    if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
        try {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [CONFIG STAMP] Serialized profile ${targetRig} to cauldron.config.json`,
            })
        } catch {
            // Non-blocking fallback
        }
    }

    if (bal.slv) {
        bal.slv({
            cfgBit: {
                idx: 'stamp-config',
                val: 1,
                dat: configPayload,
            },
        })
    }
    return cpy
}
