import * as fs from 'fs'
import * as path from 'path'
import ConfigBit from '../fce/config.bit.js'
import { ConfigModel } from '../config.model.js'
import State from '../../99.core/state.js'

export const initDirectiveLedger = async (
    cpy: ConfigModel,
    bal: ConfigBit,
    ste: State,
): Promise<ConfigModel> => {
    const rootDir = process.cwd()
    const day = bal.src || cpy.activeDay || '002'
    const directiveDir = path.join(rootDir, 'data', 'directive', `day-${day}`)
    const targetSpec = path.join(directiveDir, 'task-spec.json')

    if (!fs.existsSync(directiveDir)) {
        fs.mkdirSync(directiveDir, { recursive: true })
    }

    const specPayload = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        day,
        focus: '000.camp-candor-cauldron',
        status: 'IN_PROGRESS',
        timestamp_iso: new Date().toISOString(),
        invariants: {
            zero_cloud_cost_t0: true,
            immutable_library_boundary: true,
            local_first_node_boundary: true,
            pure_7bit_ascii: true,
        },
    }

    fs.writeFileSync(targetSpec, JSON.stringify(specPayload, null, 2), {
        encoding: 'utf8',
    })

    cpy.directiveLedgerPath = targetSpec
    cpy.lastStampedSpec = specPayload

    if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
        try {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [DIRECTIVE] Initialized ledger at data/directive/day-${day}/task-spec.json`,
            })
        } catch {
            // Non-blocking console update
        }
    }

    if (bal.slv)
        bal.slv({ cfgBit: { idx: 'init-directive-ledger', dat: specPayload } })
    return cpy
}
