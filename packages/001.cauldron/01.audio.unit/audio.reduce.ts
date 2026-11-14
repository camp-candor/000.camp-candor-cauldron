import clone from 'clone-deep'
import * as Act from './audio.action'
import { AudioModel } from './audio.model'
import * as Buzz from './audio.buzzer'
import State from '../99.core/state'

export function reducer(
    model: AudioModel = new AudioModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_AUDIO:
            return Buzz.updateAudio(clone(model), act.bale, state)

        case Act.INIT_AUDIO:
            return Buzz.initAudio(clone(model), act.bale, state)

        case Act.QUANTIZE_DURATION:
            return Buzz.quantizeDuration(clone(model), act.bale, state)

        default:
            return model
    }
}
