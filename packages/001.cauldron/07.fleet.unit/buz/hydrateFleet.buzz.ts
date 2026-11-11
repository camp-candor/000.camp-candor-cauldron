import * as fs from 'fs'
import * as path from 'path'
import FleetBit, { FleetManifest } from '../fce/fleet.bit.js'
import { FleetModel } from '../fleet.model.js'
import State from '../../99.core/state.js'
import { stampClusterTombstone } from './stampTombstone.buzz.js'

export const hydrateFleet = async (
    cpy: FleetModel,
    bal: FleetBit,
    ste: State,
): Promise<FleetModel> => {
    const role = (bal.src || 'systems').toLowerCase()
    const rootDir =
        bal.dat?.customWorkspaceRoot || path.resolve(process.cwd(), '..')
    const versionsPath = path.join(process.cwd(), 'versions.json')

    if (!fs.existsSync(versionsPath)) {
        throw new Error(`versions.json manifest not found at ${versionsPath}`)
    }

    const manifest: FleetManifest = JSON.parse(
        fs.readFileSync(versionsPath, 'utf8'),
    )
    const repos = manifest.repos || {}

    cpy.status = 'HYDRATING'
    cpy.lastHydratedRole = role
    cpy.hydratedRepos = []
    cpy.tombstonedClusters = []

    const logConsole = async (msg: string) => {
        if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
            try {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
            } catch {
                // Safe fallback
            }
        }
    }

    await logConsole(
        `>> [FLEET] Commencing fleet hydration for role: ${role.toUpperCase()}`,
    )

    for (const [repoName, entry] of Object.entries(repos)) {
        const clusterDir = path.join(rootDir, entry.cluster)
        const repoTargetDir = path.join(clusterDir, repoName)
        const matchesRole =
            role === 'all' || (entry.roles && entry.roles.includes(role))

        if (!matchesRole) {
            stampClusterTombstone(
                cpy,
                {
                    idx: 'tomb',
                    dat: {
                        targetClusterDir: clusterDir,
                        clusterName: entry.cluster,
                        reason: `MASKED_FOR_ROLE_${role.toUpperCase()}`,
                    },
                },
                ste,
            )
            await logConsole(
                `>> [TOMBSTONE] Masked cluster: ${entry.cluster} (Excluded by role: ${role})`,
            )
            continue
        }

        if (!fs.existsSync(clusterDir)) {
            fs.mkdirSync(clusterDir, { recursive: true })
        }

        if (bal.dat?.dryRun) {
            cpy.hydratedRepos.push(repoName)
            await logConsole(
                `>> [DRY RUN] Would clone ${entry.cluster}/${repoName} at ref ${entry.ref}`,
            )
            continue
        }

        if (!fs.existsSync(repoTargetDir)) {
            await logConsole(
                `>> [HYDRATE] Fetching ${entry.cluster}/${repoName} [depth=1, blobless]...`,
            )
            try {
                await ste.hunt('[Stream action] Run Command', {
                    dat: {
                        command: 'git',
                        args: [
                            'clone',
                            '--depth',
                            '1',
                            '--filter=blob:none',
                            entry.url,
                            repoTargetDir,
                        ],
                        prefix: 'GIT',
                    },
                })
                cpy.hydratedRepos.push(repoName)
            } catch (err: any) {
                await logConsole(
                    `>> [FAIL] Cloning ${repoName} encountered fault: ${err.message}`,
                )
            }
        } else {
            cpy.hydratedRepos.push(repoName)
            await logConsole(
                `>> [OK] Verified existing inode at ${entry.cluster}/${repoName}`,
            )
        }
    }

    cpy.status = 'COMPLETE'
    await logConsole(
        `>> [FLEET] Hydration complete. Hydrated: ${cpy.hydratedRepos.length}, Tombstoned: ${cpy.tombstonedClusters.length}`,
    )

    if (bal.slv) {
        bal.slv({
            fltBit: {
                idx: 'hydrate-fleet',
                val: 1,
                dat: {
                    role,
                    hydratedCount: cpy.hydratedRepos.length,
                    tombstonedCount: cpy.tombstonedClusters.length,
                },
            },
        })
    }
    return cpy
}
