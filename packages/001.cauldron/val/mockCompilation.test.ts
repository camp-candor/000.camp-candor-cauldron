import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { EpisodeModel } from '../06.episode.unit/episode.model.js'
import { validateDialogueAst } from '../06.episode.unit/buz/validateDialogueAst.buzz.js'
import { AudioModel } from '../01.audio.unit/audio.model.js'
import { quantizeDuration } from '../01.audio.unit/buz/quantizeDuration.buzz.js'
import { RemotionModel } from '../10.remotion.unit/remotion.model.js'
import { buildRemotionRoot } from '../10.remotion.unit/buz/buildRemotionRoot.buzz.js'
import { CompilationModel } from '../02.compilation.unit/compilation.model.js'
import { runMockCompilation } from '../02.compilation.unit/buz/runMockCompilation.buzz.js'

describe('Phase 6 Offline Starter Episode Assembly & Zero-Cost Compilation Test Battery', () => {
    const sandboxDir = path.join(process.cwd(), 'data', 'test-sandbox-starter')
    const dummyWavPath = path.join(sandboxDir, 'dummy.wav')

    beforeEach(() => {
        if (!fs.existsSync(sandboxDir)) {
            fs.mkdirSync(sandboxDir, { recursive: true })
        }
        // Write 44-byte minimal canonical PCM WAV header (1 second, 48000 Hz, 16-bit mono)
        const header = Buffer.alloc(44)
        header.write('RIFF', 0)
        header.writeUInt32LE(36 + 96000, 4)
        header.write('WAVE', 8)
        header.write('fmt ', 12)
        header.writeUInt32LE(16, 16)
        header.writeUInt16LE(1, 20)
        header.writeUInt16LE(1, 22)
        header.writeUInt32LE(48000, 24)
        header.writeUInt32LE(96000, 28)
        header.writeUInt16LE(2, 32)
        header.writeUInt16LE(16, 34)
        header.write('data', 36)
        header.writeUInt32LE(96000, 40)
        fs.writeFileSync(
            dummyWavPath,
            Buffer.concat([header, Buffer.alloc(96000)]),
        )
    })

    afterEach(() => {
        if (fs.existsSync(sandboxDir)) {
            fs.rmSync(sandboxDir, { recursive: true, force: true })
        }
    })

    it('TASK-6.1: validates starter dialogue AST payload against schema invariants', () => {
        const model = new EpisodeModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        validateDialogueAst(
            model,
            {
                idx: 'test-ast',
                slv: (res: any) => {
                    resolvedBit = res.epsBit
                },
            },
            fakeState,
        )

        expect(model.isValid).toBe(true)
        expect(resolvedBit.val).toBeGreaterThan(0)
        expect(model.lastValidatedAst?.scene_id).toBe('ep000_sc01')
    })

    it('TASK-6.2: quantizes continuous audio duration into discrete 24 fps integer frames', () => {
        const model = new AudioModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        quantizeDuration(
            model,
            {
                idx: 'test-quant',
                src: dummyWavPath,
                slv: (res: any) => {
                    resolvedBit = res.audBit
                },
            },
            fakeState,
        )

        expect(resolvedBit.val).toBeGreaterThan(0)
        expect(model.lastQuantization?.fps).toBe(24)
        expect(model.lastQuantization?.sha256).toBeDefined()
    })

    it('TASK-6.3: asserts physical existence and syntax of starter Remotion root composition', () => {
        const model = new RemotionModel()
        const fakeState: any = {}
        let resolvedBit: any = null

        buildRemotionRoot(
            model,
            {
                idx: 'test-remotion',
                slv: (res: any) => {
                    resolvedBit = res.remBit
                },
            },
            fakeState,
        )

        expect(model.rootVerified).toBe(true)
        expect(resolvedBit.val).toBe(1)
    })

    it('TASK-6.4: runs full mock compilation dry run asserting zero cloud cost and canonical status', async () => {
        const model = new CompilationModel()
        const fakeState: any = {
            hunt: async (action: string, bal: any) => {
                if (action.includes('Validate Dialogue Ast')) {
                    if (bal.slv)
                        bal.slv({
                            epsBit: {
                                dat: { scene_id: 'ep000_sc01', lines: [{}] },
                            },
                        })
                } else if (action.includes('Quantize Duration')) {
                    if (bal.slv)
                        bal.slv({
                            audBit: {
                                dat: {
                                    durationSec: 2.4,
                                    durationMs: 2400,
                                    totalFrames: 58,
                                },
                            },
                        })
                } else if (action.includes('Build Remotion Root')) {
                    if (bal.slv) bal.slv({ remBit: { val: 1 } })
                }
            },
        }
        let resolvedBit: any = null

        await runMockCompilation(
            model,
            {
                idx: 'test-mock-run',
                dat: { dryRun: true },
                slv: (res: any) => {
                    resolvedBit = res.cmpBit
                },
            },
            fakeState,
        )

        expect(resolvedBit.val).toBe(1)
        expect(model.lastRunSummary?.status).toBe('CANONICAL')
        expect(model.lastRunSummary?.cloudCost).toBe('$0.00')
        expect(model.lastRunSummary?.totalFrames).toBe(58)
    })
})
