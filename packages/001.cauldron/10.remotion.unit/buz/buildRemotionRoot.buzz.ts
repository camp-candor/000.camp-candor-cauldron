import * as fs from 'fs'
import * as path from 'path'
import RemotionBit from '../fce/remotion.bit.js'
import { RemotionModel } from '../remotion.model.js'
import State from '../../99.core/state.js'

export const buildRemotionRoot = (
    cpy: RemotionModel,
    bal: RemotionBit,
    ste: State,
): RemotionModel => {
    const rootDir = bal.dat?.customRoot || process.cwd()
    const rootPath =
        bal.src ||
        path.join(
            rootDir,
            'examples',
            'episode-000-starter',
            'remotion',
            'Root.tsx',
        )

    if (!fs.existsSync(rootPath)) {
        throw new Error(`Starter Remotion root file not found at ${rootPath}`)
    }

    cpy.rootVerified = true
    cpy.compositionPath = rootPath

    if (bal.slv) {
        bal.slv({
            remBit: {
                idx: 'build-remotion-root',
                val: 1,
                dat: { rootPath, verified: true },
            },
        })
    }
    return cpy
}
