import StreamBit from '../fce/stream.bit.js'
import { StreamModel } from '../stream.model.js'
import State from '../../99.core/state.js'

export const sanitizeAsciiStream = (
    cpy: StreamModel,
    bal: StreamBit,
    ste: State,
): StreamModel => {
    const input = bal.src || ''
    // Strip ANSI color / cursor escapes and filter to standard printable 7-bit ASCII
    const sanitized = input
        .replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            '',
        )
        .replace(/[^\x20-\x7E\n\r\t]/g, '')
        .trimEnd()

    if (bal.slv)
        bal.slv({ stmBit: { idx: 'sanitize-ascii-stream', dat: sanitized } })
    return cpy
}
