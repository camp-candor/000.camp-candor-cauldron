import * as fs from 'fs'
import * as path from 'path'
import FleetBit from '../fce/fleet.bit.js'
import { FleetModel } from '../fleet.model.js'
import State from '../../99.core/state.js'

export const stampClusterTombstone = (
    cpy: FleetModel,
    bal: FleetBit,
    ste: State,
): FleetModel => {
    const { targetClusterDir, clusterName, reason } = bal.dat || {}

    if (!targetClusterDir || !clusterName) {
        throw new Error(
            'stampClusterTombstone requires targetClusterDir and clusterName in bal.dat',
        )
    }

    if (!fs.existsSync(targetClusterDir)) {
        fs.mkdirSync(targetClusterDir, { recursive: true })
    }

    const tombstonePath = path.join(targetClusterDir, '.tombstone.json')
    const marker = {
        cluster: clusterName,
        hydrated: false,
        reason: reason || 'EXCLUDED_BY_ROLE_MASK',
        stamped_at: new Date().toISOString(),
    }

    fs.writeFileSync(tombstonePath, JSON.stringify(marker, null, 2), {
        encoding: 'utf8',
    })

    if (!cpy.tombstonedClusters.includes(clusterName)) {
        cpy.tombstonedClusters.push(clusterName)
    }

    if (bal.slv) {
        bal.slv({
            fltBit: {
                idx: 'stamp-tombstone',
                val: 1,
                dat: marker,
            },
        })
    }
    return cpy
}
