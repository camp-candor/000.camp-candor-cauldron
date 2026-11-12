import * as fs from 'fs'
import * as crypto from 'crypto'
import { execFileSync } from 'child_process'
import AudioBit, { AudioQuantizationReceipt } from '../fce/audio.bit.js'
import { AudioModel } from '../audio.model.js'
import State from '../../99.core/state.js'

export const quantizeDuration = (
    cpy: AudioModel,
    bal: AudioBit,
    ste: State,
): AudioModel => {
    const filePath = bal.src || ''

    if (!fs.existsSync(filePath)) {
        throw new Error(`Audio target file does not exist: ${filePath}`)
    }

    const stat = fs.statSync(filePath)
    if (stat.size === 0) {
        throw new Error(`ZERO_BYTE_ASSET_POISON: ${filePath} is 0 bytes`)
    }

    const fileBuf = fs.readFileSync(filePath)
    const sha256 = crypto.createHash('sha256').update(fileBuf).digest('hex')
    if (
        sha256 ===
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    ) {
        throw new Error(
            `ZERO_BYTE_ASSET_POISON: ${filePath} matches empty sha256`,
        )
    }

    let durationSec = 2.4
    try {
        const rawOut = execFileSync(
            'ffprobe',
            [
                '-v',
                'error',
                '-show_entries',
                'format=duration',
                '-of',
                'default=noprint_wrappers=1:nokey=1',
                filePath,
            ],
            { encoding: 'utf8', timeout: 3000 },
        ).trim()
        const parsed = parseFloat(rawOut)
        if (!isNaN(parsed) && parsed > 0) {
            durationSec = parsed
        }
    } catch {
        durationSec = 2.4 // Controlled offline fallback
    }

    const durationMs = Math.round(durationSec * 1000)
    const fps = 24
    const totalFrames = Math.ceil((durationMs / 1000) * fps)

    const receipt: AudioQuantizationReceipt = {
        filePath,
        durationSec,
        durationMs,
        totalFrames,
        fps,
        sha256,
    }

    cpy.lastQuantization = receipt
    cpy.history.push(receipt)

    if (bal.slv) {
        bal.slv({
            audBit: {
                idx: 'quantize-duration',
                val: totalFrames,
                dat: receipt,
            },
        })
    }
    return cpy
}
