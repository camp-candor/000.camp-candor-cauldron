import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { RoleModel } from '../11.role.unit/role.model.js'
import { selectContributorRole } from '../11.role.unit/buz/selectRole.buzz.js'
import { FleetModel } from '../07.fleet.unit/fleet.model.js'
import { stampClusterTombstone } from '../07.fleet.unit/buz/stampTombstone.buzz.js'
import { hydrateFleet } from '../07.fleet.unit/buz/hydrateFleet.buzz.js'

describe('Phase 4 Contributor Roles & Fleet Orchestration Test Battery', () => {
    const sandboxRoot = path.join(process.cwd(), 'data', 'test-sandbox-fleet')

    beforeEach(() => {
        if (!fs.existsSync(sandboxRoot)) {
            fs.mkdirSync(sandboxRoot, { recursive: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(sandboxRoot)) {
            fs.rmSync(sandboxRoot, { recursive: true, force: true })
        }
    })

    it('TASK-4.1: selects and stores active contributor role deterministically', async () => {
        const model = new RoleModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        await selectContributorRole(
            model,
            {
                idx: 'test-role',
                src: 'writer',
                slv: (res: any) => {
                    resolvedBit = res.rleBit
                },
            },
            fakeState,
        )

        expect(model.activeRole).toBe('writer')
        expect(resolvedBit.src).toBe('writer')
        expect(typeof model.selectedAt).toBe('string')
    })

    it('TASK-4.2: stamps .tombstone.json marker with proper schema for excluded clusters', () => {
        const model = new FleetModel()
        const fakeState: any = {}
        const clusterDir = path.join(sandboxRoot, '04.assets')

        let tombstoneBit: any = null
        stampClusterTombstone(
            model,
            {
                idx: 'test-tomb',
                dat: {
                    targetClusterDir: clusterDir,
                    clusterName: '04.assets',
                    reason: 'MASKED_FOR_ROLE_WRITER',
                },
                slv: (res: any) => {
                    tombstoneBit = res.fltBit
                },
            },
            fakeState,
        )

        const markerPath = path.join(clusterDir, '.tombstone.json')
        expect(fs.existsSync(markerPath)).toBe(true)

        const payload = JSON.parse(fs.readFileSync(markerPath, 'utf8'))
        expect(payload.cluster).toBe('04.assets')
        expect(payload.hydrated).toBe(false)
        expect(payload.reason).toBe('MASKED_FOR_ROLE_WRITER')
        expect(model.tombstonedClusters).toContain('04.assets')
    })

    it('TASK-4.3: executes dry run fleet hydration filtering by writer role envelope', async () => {
        const model = new FleetModel()
        const fakeState: any = {}
        let hydrateResult: any = null

        await hydrateFleet(
            model,
            {
                idx: 'test-hydrate',
                src: 'writer',
                dat: {
                    customWorkspaceRoot: sandboxRoot,
                    dryRun: true,
                },
                slv: (res: any) => {
                    hydrateResult = res.fltBit
                },
            },
            fakeState,
        )

        expect(model.status).toBe('COMPLETE')
        expect(model.lastHydratedRole).toBe('writer')
        expect(model.hydratedRepos).toContain('001.goblin-lore')
        expect(model.tombstonedClusters).toContain('04.assets')
        expect(hydrateResult?.val).toBe(1)
    })
})
