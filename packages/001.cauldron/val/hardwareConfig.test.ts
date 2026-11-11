import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { HardwareModel } from '../08.hardware.unit/hardware.model.js'
import { selectHardwareProfile } from '../08.hardware.unit/buz/selectHardware.buzz.js'
import { ConfigModel } from '../03.config.unit/config.model.js'
import { stampHardwareConfiguration } from '../03.config.unit/buz/stampConfig.buzz.js'

describe('Phase 3 Hardware Identity & Configuration Serialization Test Battery', () => {
    const sandboxDir = path.join(process.cwd(), 'data', 'test-sandbox-config')

    beforeEach(() => {
        if (!fs.existsSync(sandboxDir)) {
            fs.mkdirSync(sandboxDir, { recursive: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(sandboxDir)) {
            fs.rmSync(sandboxDir, { recursive: true, force: true })
        }
    })

    it('TASK-3.1: selects RIG_1_CONDUCTOR profile deterministically', async () => {
        const model = new HardwareModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        await selectHardwareProfile(
            model,
            {
                idx: 'test-hrd-1',
                src: 'RIG_1_CONDUCTOR',
                slv: (res: any) => {
                    resolvedBit = res.hrdBit
                },
            },
            fakeState,
        )

        expect(model.selectedRig).toBe('RIG_1_CONDUCTOR')
        expect(resolvedBit.val).toBe(1)
        expect(resolvedBit.dat.rig_identity).toBe('RIG_1_CONDUCTOR')
    })

    it('TASK-3.2: selects RIG_2_FOUNDRY profile deterministically', async () => {
        const model = new HardwareModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        await selectHardwareProfile(
            model,
            {
                idx: 'test-hrd-2',
                src: 'RIG_2_FOUNDRY',
                slv: (res: any) => {
                    resolvedBit = res.hrdBit
                },
            },
            fakeState,
        )

        expect(model.selectedRig).toBe('RIG_2_FOUNDRY')
        expect(resolvedBit.val).toBe(2)
        expect(resolvedBit.dat.rig_identity).toBe('RIG_2_FOUNDRY')
    })

    it('TASK-3.3: atomically writes cauldron.config.json for RIG_1 profile', async () => {
        const model = new ConfigModel()
        const fakeState: any = {}
        let configBit: any = null

        await stampHardwareConfiguration(
            model,
            {
                idx: 'test-stamp-1',
                src: 'RIG_1_CONDUCTOR',
                dat: { customRoot: sandboxDir },
                slv: (res: any) => {
                    configBit = res.cfgBit
                },
            },
            fakeState,
        )

        const configPath = path.join(sandboxDir, 'cauldron.config.json')
        expect(fs.existsSync(configPath)).toBe(true)
        expect(
            fs.existsSync(path.join(sandboxDir, 'cauldron.config.json.tmp')),
        ).toBe(false)

        const content = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        expect(content.rig_identity).toBe('RIG_1_CONDUCTOR')
        expect(content.audio_port).toBe(8000)
        expect(content.gpu_acceleration).toBe(false)
        expect(content.max_memory_concurrency).toBe(1)
        expect(configBit.val).toBe(1)
    })

    it('TASK-3.4: atomically writes cauldron.config.json for RIG_2 profile', async () => {
        const model = new ConfigModel()
        const fakeState: any = {}
        let configBit: any = null

        await stampHardwareConfiguration(
            model,
            {
                idx: 'test-stamp-2',
                src: 'RIG_2_FOUNDRY',
                dat: { customRoot: sandboxDir },
                slv: (res: any) => {
                    configBit = res.cfgBit
                },
            },
            fakeState,
        )

        const configPath = path.join(sandboxDir, 'cauldron.config.json')
        expect(fs.existsSync(configPath)).toBe(true)

        const content = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        expect(content.rig_identity).toBe('RIG_2_FOUNDRY')
        expect(content.audio_port).toBe(8001)
        expect(content.gpu_acceleration).toBe(true)
        expect(content.max_memory_concurrency).toBe(4)
        expect(configBit.val).toBe(1)
    })
})
