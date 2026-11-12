/* eslint-disable */
import * as ActMnu from '../menu.action.js'
//import * as ActAgt from '../../00.agent.unit/agent.action.js';
import * as ActOlm from '../../00.cauldron.unit/cauldron.action.js'
import * as ActStr from '../../12.stream.unit/stream.action.js'
import * as ActDoc from '../../04.doctor.unit/doctor.action.js'

import { selectHardwareProfile } from '../../08.hardware.unit/buz/selectHardware.buzz.js'
import { HardwareModel } from '../../08.hardware.unit/hardware.model.js'
import { stampHardwareConfiguration } from '../../03.config.unit/buz/stampConfig.buzz.js'
import { ConfigModel } from '../../03.config.unit/config.model.js'

import type { MenuModel } from '../menu.model.js'
import type MenuBit from '../fce/menu.bit.js'
import type State from '../../99.core/state.js'

import * as Grid from '../../val/grid.js'
import * as Align from '../../val/align.js'
import * as Color from '../../val/console-color.js'

import * as SHAPE from '../../val/shape.js'
import * as FOCUS from '../../val/focus.js'

let bit, lst, dex, idx, dat, src, val
let rootSlv

let SOWER, AGENT, CLICKUP, CAULDRON

const UPDATE_GRID = '[Grid action] Update Grid'
const WRITE_CONSOLE = '[Write action] Write Console'
const UPDATE_CONSOLE = '[Console action] Update Console'
const OPEN_CHOICE = '[Open action] Open Choice'
const CLOSE_TERMINAL = '[Close action] Close Terminal'
const PRINT_MENU = '[Render action] Print Menu'

export const initMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    if (bal.slv != null) rootSlv = bal.slv

    bit = await global.LIBRARY.hunt(UPDATE_GRID, {
        x: 4,
        y: 0,
        xSpan: 8,
        ySpan: 12,
    })
    bit = await global.LIBRARY.hunt(WRITE_CONSOLE, {
        idx: 'cns00',
        src: '',
        dat: { net: bit.grdBit.dat, src: 'alligaor0' },
    })

    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })
    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: 'CAULDRON MENU',
    })

    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })

    await updateMenu(cpy, bal, ste)

    return cpy
}

export const updateMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    lst = [
        'CONFIGURE HARDWARE RIG',
        'RUN CAULDRON DOCTOR',
        ActOlm.UPDATE_CAULDRON.split(']')[1],
        ActOlm.TEST_CAULDRON.split(']')[1],
        ActOlm.LIST_CAULDRON.split(']')[1],
        'STREAM TEST',
        'ROOT MENU',
    ]

    bit = await global.LIBRARY.hunt(UPDATE_GRID, {
        x: 0,
        y: 4,
        xSpan: 4,
        ySpan: 8,
    })
    bit = await global.LIBRARY.hunt(OPEN_CHOICE, {
        dat: { clr0: Color.BLACK, clr1: Color.YELLOW },
        src: Align.VERTICAL,
        lst,
        net: bit.grdBit.dat,
    })

    src = bit.chcBit.src

    switch (src) {
        case 'CONFIGURE HARDWARE RIG': {
            try {
                const hrdCpy = new HardwareModel()
                const cfgCpy = new ConfigModel()

                // Interactive path: no src bale opens the choice-hardware modal
                // through the master library bus, then resolves the operator pick.
                await selectHardwareProfile(
                    hrdCpy,
                    { idx: 'configure-hardware-rig' } as any,
                    ste,
                )

                const stampedRig = hrdCpy.selectedRig

                // Atomic POSIX serialization: .tmp staging then renameSync swap
                await stampHardwareConfiguration(
                    cfgCpy,
                    { idx: 'stamp-hardware-config', src: stampedRig } as any,
                    ste,
                )
            } catch (e: any) {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src:
                        '>> [RE-WIRE ERROR] Hardware config faulted: ' +
                        (e && e.message ? e.message : String(e)),
                })
            }
            break
        }

        case 'RUN CAULDRON DOCTOR':
            try {
                bit = await ste.hunt(ActDoc.RUN_DOCTOR, {})
            } catch (e: any) {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src:
                        '>> [RE-WIRE ERROR] Cauldron doctor faulted: ' +
                        (e && e.message ? e.message : String(e)),
                })
            }
            break

        case ActOlm.UPDATE_CAULDRON.split(']')[1]:
            bit = await ste.hunt(ActOlm.UPDATE_CAULDRON, {
                content: 'Cauldron Menu Selected',
            })
            bit = await global.LIBRARY.hunt(PRINT_MENU, bit)
            break

        case ActOlm.TEST_CAULDRON.split(']')[1]:
            bit = await ste.hunt(ActOlm.TEST_CAULDRON, {
                content: 'Cauldron Menu Selected',
            })
            bit = await global.LIBRARY.hunt(PRINT_MENU, bit)
            break

        case ActOlm.LIST_CAULDRON.split(']')[1]:
            bit = await ste.hunt(ActOlm.LIST_CAULDRON, {})
            lst = bit.olmBit.lst

            if (lst.length === 0) {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: 'No Cauldron Models Found',
                })
            } else {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: 'Listing Cauldron Models...',
                })
                lst.forEach((a: string) =>
                    global.LIBRARY.hunt(UPDATE_CONSOLE, {
                        idx: 'cns00',
                        src: a,
                    }),
                )
            }

            await new Promise((resolve) => setTimeout(resolve, 3000))
            break

        case 'STREAM TEST':
            bit = await ste.hunt(ActStr.UPDATE_STREAM, {
                dat: {
                    command: 'node',
                    args: [
                        '-e',
                        'console.log("STREAM_LINE_ALPHA"); console.log("STREAM_LINE_BRAVO"); console.log("STREAM_LINE_CHARLIE")',
                    ],
                    prefix: 'STREAM',
                },
            })
            bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [STREAM] Process exited with code ${bit?.stmBit?.val}`,
            })
            break

        case 'ROOT MENU':
            if (rootSlv != null) rootSlv({ mnuBit: { idx: 'root-menu' } })
            return cpy

        default:
            bit = await ste.hunt(CLOSE_TERMINAL, {})
            break
    }

    setTimeout(async () => {
        bit = await ste.hunt(ActMnu.UPDATE_MENU, {})
    }, 333)

    return cpy
}

const patch = (ste, type, bale) => ste.dispatch({ type, bale })
