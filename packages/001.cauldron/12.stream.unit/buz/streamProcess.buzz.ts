import { spawn, SpawnOptionsWithoutStdio } from 'child_process'
import * as readline from 'readline'
import StreamBit from '../fce/stream.bit.js'
import { StreamModel } from '../stream.model.js'
import State from '../../99.core/state.js'

export const streamChildProcess = async (
    cpy: StreamModel,
    bal: StreamBit,
    ste: State,
): Promise<StreamModel> => {
    const { command, args = [], cwd, prefix } = bal.dat || {}

    if (!command) {
        throw new Error('streamChildProcess requires a valid command string')
    }

    const outputLines: string[] = []
    const logPrefix = prefix ? `[${prefix}] ` : ''

    const spawnOpts: SpawnOptionsWithoutStdio = {
        cwd: cwd || process.cwd(),
        env: { ...process.env, FORCE_COLOR: '0' },
        stdio: 'pipe',
    }

    const child = spawn(command, args, spawnOpts)

    const emitLine = async (raw: string) => {
        const clean = raw
            .replace(
                /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                '',
            )
            .replace(/[^\x20-\x7E]/g, '')
            .trimEnd()

        if (!clean) return
        outputLines.push(clean)

        if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
            try {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> ${logPrefix}${clean}`,
                })
            } catch {
                // Safe no-op if curses runtime cns00 is unmounted
            }
        }
    }

    if (child.stdout) {
        const rlOut = readline.createInterface({ input: child.stdout })
        rlOut.on('line', (line) => void emitLine(line))
    }

    if (child.stderr) {
        const rlErr = readline.createInterface({ input: child.stderr })
        rlErr.on('line', (line) => void emitLine(`ERR: ${line}`))
    }

    await new Promise<void>((resolve, reject) => {
        child.on('error', (err) => {
            void emitLine(`PROCESS FAULT: ${err.message}`)
            reject(err)
        })
        child.on('close', (code) => {
            cpy.lastExitCode = code ?? 0
            cpy.capturedLines = outputLines
            resolve()
        })
    })

    if (bal.slv)
        bal.slv({
            stmBit: {
                idx: 'stream-process',
                val: cpy.lastExitCode,
                dat: outputLines,
            },
        })
    return cpy
}
