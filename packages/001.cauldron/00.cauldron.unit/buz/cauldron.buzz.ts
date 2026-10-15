import { CauldronModel } from '../cauldron.model.js'
import CauldronBit from '../fce/cauldron.bit.js'
import State from '../../99.core/state.js'

const cauldron = {
    list: async () => {
        return { models: [] as any[] }
    },
}

export const initCauldron = (
    cpy: CauldronModel,
    bal: CauldronBit,
    ste: State,
) => {
    const url =
        process.env.CAULDRON_URL ||
        'https://zero00-cauldron.onrender.com/api/cauldron/test'
    if (url) {
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-cauldron',
                            dat: {
                                cauldron: data,
                            },
                        },
                    })
                }
            })
            .catch((error: any) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-cauldron-err',
                            dat: error.message,
                        },
                    })
                }
            })
    } else {
        if (bal.slv != null) {
            bal.slv({ intBit: { idx: 'init-cauldron' } })
        }
    }
    return cpy
}

export const updateCauldron = (
    cpy: CauldronModel,
    bal: CauldronBit,
    ste: State,
) => {
    bal.slv({ intBit: { idx: 'update-cauldron' } })

    return cpy
}

export const testCauldron = (
    cpy: CauldronModel,
    bal: CauldronBit,
    ste: State,
) => {
    bal.slv({ mytBit: { idx: 'test-cauldron', val: 1 } })
    return cpy
}

export const listCauldron = async (
    cpy: CauldronModel,
    bal: CauldronBit,
    ste: State,
) => {
    const response = await cauldron.list()
    if (bal.slv != null)
        bal.slv({
            olmBit: {
                idx: 'list-cauldron',
                lst: response.models.map((m: any) => m.name),
            },
        })
    return cpy
}
