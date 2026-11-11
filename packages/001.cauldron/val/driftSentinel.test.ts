import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { VersionsModel } from '../14.versions.unit/versions.model.js'
import { loadManifest } from '../14.versions.unit/buz/loadManifest.buzz.js'
import { DriftModel } from '../05.drift.unit/drift.model.js'
import { evaluateDrift } from '../05.drift.unit/buz/driftEvaluator.buzz.js'
import { renderDriftReport } from '../05.drift.unit/buz/renderDriftReport.buzz.js'

describe('Phase 5 Version Sentinel & Local Drift Evaluation Test Battery', () => {
    const sandboxDir = path.join(process.cwd(), 'data', 'test-sandbox-drift')
    const mockManifestPath = path.join(sandboxDir, 'versions.json')
    const mockParentRoot = path.join(sandboxDir, 'fleet')

    beforeEach(() => {
        if (!fs.existsSync(sandboxDir)) {
            fs.mkdirSync(sandboxDir, { recursive: true })
        }
        if (!fs.existsSync(mockParentRoot)) {
            fs.mkdirSync(mockParentRoot, { recursive: true })
        }

        const testManifest = {
            manifest_version: '1.0.0',
            updated_at: new Date().toISOString(),
            sovereign_repo: '000.camp-candor-cauldron',
            repos: {
                '001.goblin-lore': {
                    cluster: '01.canon',
                    url: 'https://github.com/test/001.goblin-lore.git',
                    ref: 'a1b2c3d4e5f67890123456789012345678901234',
                },
                '000.missing-repo': {
                    cluster: '02.simulation',
                    url: 'https://github.com/test/000.missing-repo.git',
                    ref: 'b2c3d4e5f678901234567890123456789012345a',
                },
            },
        }
        fs.writeFileSync(
            mockManifestPath,
            JSON.stringify(testManifest, null, 2),
            'utf8',
        )
    })

    afterEach(() => {
        if (fs.existsSync(sandboxDir)) {
            fs.rmSync(sandboxDir, { recursive: true, force: true })
        }
    })

    it('TASK-5.1: loads and validates versions.json manifest payload', () => {
        const model = new VersionsModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        loadManifest(
            model,
            {
                idx: 'test-load',
                src: mockManifestPath,
                slv: (res: any) => {
                    resolvedBit = res.vrsBit
                },
            },
            fakeState,
        )

        expect(resolvedBit.val).toBe(2)
        expect(model.cachedManifest?.sovereign_repo).toBe(
            '000.camp-candor-cauldron',
        )
        expect(model.cachedManifest?.repos['001.goblin-lore']).toBeDefined()
    })

    it('TASK-5.2: classifies absent repository inodes as MISSING', () => {
        const model = new DriftModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        evaluateDrift(
            model,
            {
                idx: 'test-eval',
                src: mockManifestPath,
                dat: { customParentRoot: mockParentRoot },
                slv: (res: any) => {
                    resolvedBit = res.drfBit
                },
            },
            fakeState,
        )

        expect(model.hasDrift).toBe(true)
        const missing = model.records.find((r) => r.repo === '000.missing-repo')
        expect(missing).toBeDefined()
        expect(missing?.status).toBe('MISSING')
    })

    it('TASK-5.3: formats and renders 7-bit ASCII drift audit ledger', async () => {
        const model = new DriftModel()
        const fakeState: any = {}
        let renderedBit: any = null

        await renderDriftReport(
            model,
            {
                idx: 'test-render',
                src: mockManifestPath,
                dat: { customParentRoot: mockParentRoot },
                slv: (res: any) => {
                    renderedBit = res.drfBit
                },
            },
            fakeState,
        )

        expect(renderedBit.dat.length).toBe(2)
        expect(model.records.length).toBe(2)
    })
})
