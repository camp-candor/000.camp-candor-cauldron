import { describe, it, expect } from 'vitest'
import { DoctorModel } from '../04.doctor.unit/doctor.model.js'
import { probeRuntime } from '../04.doctor.unit/buz/probeRuntime.buzz.js'
import { probeQuantizer } from '../04.doctor.unit/buz/probeQuantizer.buzz.js'
import { probeMemory } from '../04.doctor.unit/buz/probeMemory.buzz.js'
import { runDoctor } from '../04.doctor.unit/buz/runDoctor.buzz.js'

describe('Phase 2 Host Diagnostics & Pre-Flight Verification Test Battery', () => {
    it('TASK-2.1: asserts Node.js engine version is >= v20', () => {
        const model = new DoctorModel()
        const fakeState: any = {}
        let payload: any = null

        probeRuntime(
            model,
            {
                idx: 'test-runtime',
                slv: (res: any) => {
                    payload = res.docBit
                },
            },
            fakeState,
        )

        expect(payload).toBeDefined()
        expect(payload.val).toBe(1)
        expect(payload.dat.id).toBe('node_runtime')
        expect(payload.dat.status).toBe('PASS')
    })

    it('TASK-2.2: checks ffprobe binary presence or returns compliant WARN status', () => {
        const model = new DoctorModel()
        const fakeState: any = {}
        let payload: any = null

        probeQuantizer(
            model,
            {
                idx: 'test-quantizer',
                slv: (res: any) => {
                    payload = res.docBit
                },
            },
            fakeState,
        )

        expect(payload).toBeDefined()
        expect(['PASS', 'WARN']).toContain(payload.dat.status)
        expect(payload.dat.id).toBe('acoustic_quantizer')
    })

    it('TASK-2.3: evaluates host RAM memory footprint against 8GB recommendation', () => {
        const model = new DoctorModel()
        const fakeState: any = {}
        let payload: any = null

        probeMemory(
            model,
            {
                idx: 'test-memory',
                slv: (res: any) => {
                    payload = res.docBit
                },
            },
            fakeState,
        )

        expect(payload).toBeDefined()
        expect(payload.dat.id).toBe('viewport_ram')
        expect(typeof payload.dat.details).toBe('string')
    })

    it('TASK-2.4: runs full doctor diagnostic gauntlet and aggregates reports', async () => {
        const model = new DoctorModel()
        const fakeState: any = {}
        let payload: any = null

        await runDoctor(
            model,
            {
                idx: 'test-doctor',
                slv: (res: any) => {
                    payload = res.docBit
                },
            },
            fakeState,
        )

        expect(payload).toBeDefined()
        expect(Array.isArray(payload.dat)).toBe(true)
        expect(payload.dat.length).toBe(3)
        expect(model.reports.length).toBe(3)
        expect(model.lastRunPassed).toBe(payload.val === 1)
    })
})
