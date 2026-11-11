import MenuBit from '../fce/menu.bit.js'
import { MenuModel } from '../menu.model.js'
import State from '../../99.core/state.js'

export const flightDeckMenu = async (
    cpy: MenuModel,
    bal: MenuBit,
    ste: State,
): Promise<MenuModel> => {
    const choiceNames = cpy.choices.map((c) => c.name)

    // Headless CI / Vitest Graceful Fallback
    if (!global.LIBRARY || typeof global.LIBRARY.hunt !== 'function') {
        cpy.activeSelection = bal.src || choiceNames[0]
        if (bal.slv)
            bal.slv({
                mnuBit: { idx: 'headless-menu', src: cpy.activeSelection },
            })
        return cpy
    }

    // 1. Position Left Control Axis Menu in 12x12 Blessed Grid
    const gridBit = await global.LIBRARY.hunt('[Grid action] Update Grid', {
        x: 0,
        y: 4,
        xSpan: 4,
        ySpan: 8,
    })

    // 2. Open Interactive Choice Modal with Tooltip Streamer
    const choiceBit = await global.LIBRARY.hunt('[Open action] Open Choice', {
        dat: { clr0: 'black', clr1: 'yellow' },
        src: 'vertical',
        lst: choiceNames,
        net: gridBit?.grdBit?.dat,
        cb: async (idxVal: number) => {
            const selectedItem = cpy.choices[idxVal]
            if (selectedItem) {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> [FOCUS] ${selectedItem.tooltip}`,
                })
            }
        },
    })

    const selection = choiceBit?.chcBit?.src || choiceNames[0]
    cpy.activeSelection = selection
    cpy.lastActionTimestamp = new Date().toISOString()
    cpy.isProcessing = true

    const targetItem = cpy.choices.find((c) => c.name === selection)

    switch (targetItem?.actionKey) {
        case 'RUN_DOCTOR':
            await ste.hunt('[Doctor action] Run Doctor', {})
            break
        case 'CONFIG_RIG':
            await ste.hunt('[Hardware action] Select Hardware', {})
            break
        case 'HYDRATE_FLEET':
            await ste.hunt('[Fleet action] Hydrate Fleet', {})
            break
        case 'AUDIT_VERSIONS':
            await ste.hunt('[Drift action] Render Drift Report', {})
            break
        case 'MOCK_DEMO':
            await ste.hunt('[Compilation action] Run Mock Compilation', {})
            break
        case 'ROOT_MENU':
            cpy.isProcessing = false
            if (bal.slv)
                bal.slv({ mnuBit: { idx: 'root-menu', src: selection } })
            return cpy
    }

    cpy.isProcessing = false

    // Re-entrant non-recursive tick loop scheduling
    setTimeout(() => {
        void flightDeckMenu(cpy, { idx: 'menu-tick' }, ste)
    }, 333)

    if (bal.slv)
        bal.slv({ mnuBit: { idx: 'flight-deck-menu', src: selection } })
    return cpy
}
