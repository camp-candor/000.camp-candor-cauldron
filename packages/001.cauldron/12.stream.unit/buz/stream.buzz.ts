import { StreamModel } from '../stream.model'
import StreamBit from '../fce/stream.bit'
import State from '../../99.core/state'
import { streamChildProcess } from './streamProcess.buzz'

export const initStream = (cpy: StreamModel, bal: StreamBit, _ste: State) => {
    if (bal && bal.slv != null) {
        bal.slv({ stmBit: { idx: 'init-stream-stub' } })
    }
    return cpy
}

export const updateStream = (cpy: StreamModel, bal: StreamBit, ste: State) => {
    // Delegate process spawning to the audited streamProcess buzzer,
    // which captures lines and dispatches telemetry to console cns00.
    return streamChildProcess(cpy, bal, ste)
}
