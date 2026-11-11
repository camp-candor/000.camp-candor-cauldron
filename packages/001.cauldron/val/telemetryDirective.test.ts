import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { ConfigModel } from '../03.config.unit/config.model.js'
import { initDirectiveLedger } from '../03.config.unit/buz/directiveInit.buzz.js'
import { StreamModel } from '../12.stream.unit/stream.model.js'
import { sanitizeAsciiStream } from '../12.stream.unit/buz/asciiSanitizer.buzz.js'
import { streamChildProcess } from '../12.stream.unit/buz/streamProcess.buzz.js'

describe('Phase 1 Foundational Telemetry & Directive Governance Test Battery', () => {
    const testDir = path.join(process.cwd(), 'data', 'directive', 'day-test')

    afterEach(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true })
        }
    })

    it('TASK-1.1: stamps a valid task-spec.json inside data/directive/day-test/', async () => {
        const model = new ConfigModel()
        const fakeState: any = {}

        let resolveData: any = null
        await initDirectiveLedger(
            model,
            {
                idx: 'init',
                src: 'test',
                slv: (res: any) => {
                    resolveData = res
                },
            },
            fakeState,
        )

        const specPath = path.join(testDir, 'task-spec.json')
        expect(fs.existsSync(specPath)).toBe(true)

        const content = JSON.parse(fs.readFileSync(specPath, 'utf8'))
        expect(content.day).toBe('test')
        expect(content.focus).toBe('000.camp-candor-cauldron')
        expect(content.invariants.pure_7bit_ascii).toBe(true)
        expect(resolveData?.cfgBit?.dat?.status).toBe('IN_PROGRESS')
    })

    it('TASK-1.2: strips ANSI escape sequences and non-ASCII chars from stream text', () => {
        const model = new StreamModel()
        const fakeState: any = {}
        const dirty =
            '\u001b[31mRed Alert!\u001b[0m \u2705 Non-Ascii \x07 Token'

        let sanitizedOut = ''
        sanitizeAsciiStream(
            model,
            {
                idx: 'clean',
                src: dirty,
                slv: (res: any) => {
                    sanitizedOut = res.stmBit.dat
                },
            },
            fakeState,
        )

        expect(sanitizedOut).toBe('Red Alert!  Non-Ascii  Token')
        expect(/^[\x20-\x7E\s]*$/.test(sanitizedOut)).toBe(true)
    })

    it('TASK-1.3: executes child process, captures output lines, and returns exit code 0', async () => {
        const model = new StreamModel()
        const fakeState: any = {}

        let execResult: any = null
        await streamChildProcess(
            model,
            {
                idx: 'run-echo',
                dat: {
                    command: process.platform === 'win32' ? 'cmd.exe' : 'echo',
                    args:
                        process.platform === 'win32'
                            ? ['/c', 'echo', 'CANONICAL_TEST_OUTPUT']
                            : ['CANONICAL_TEST_OUTPUT'],
                    prefix: 'TEST',
                },
                slv: (res: any) => {
                    execResult = res
                },
            },
            fakeState,
        )

        expect(execResult?.stmBit?.val).toBe(0)
        expect(execResult?.stmBit?.dat).toContain('CANONICAL_TEST_OUTPUT')
    })
})
