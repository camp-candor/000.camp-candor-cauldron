import * as fs from 'fs'
import * as path from 'path'
import EpisodeBit, { DialogueAstPayload } from '../fce/episode.bit.js'
import { EpisodeModel } from '../episode.model.js'
import State from '../../99.core/state.js'

export const validateDialogueAst = (
    cpy: EpisodeModel,
    bal: EpisodeBit,
    ste: State,
): EpisodeModel => {
    const rootDir = bal.dat?.customRoot || process.cwd()
    const astPath =
        bal.src ||
        path.join(
            rootDir,
            'examples',
            'episode-000-starter',
            'dialogue_ast.json',
        )

    if (!fs.existsSync(astPath)) {
        throw new Error(`Starter dialogue AST fixture not found at ${astPath}`)
    }

    const raw = fs.readFileSync(astPath, 'utf8')
    const payload: DialogueAstPayload = JSON.parse(raw)

    if (
        !payload.scene_id ||
        !Array.isArray(payload.lines) ||
        payload.lines.length === 0
    ) {
        throw new Error('Malformed or empty dialogue_ast.json structure')
    }

    for (const line of payload.lines) {
        if (!line.id || !line.speaker || !line.audio_stem) {
            throw new Error(
                `Invalid line contract in dialogue_ast.json for line id: ${line.id || 'unknown'}`,
            )
        }
    }

    cpy.lastValidatedAst = payload
    cpy.isValid = true
    cpy.validatedAt = new Date().toISOString()

    if (bal.slv) {
        bal.slv({
            epsBit: {
                idx: 'validate-dialogue-ast',
                val: payload.lines.length,
                dat: payload,
            },
        })
    }
    return cpy
}
