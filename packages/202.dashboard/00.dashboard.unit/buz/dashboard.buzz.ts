import { DashboardModel } from '../dashboard.model.js'
import DashboardBit from '../fce/dashboard.bit.js'
import State from '../../99.core/state.js'

const dashboard = {
    list: async () => {
        return { models: [] as any[] }
    },
}

export const initDashboard = (
    cpy: DashboardModel,
    bal: DashboardBit,
    ste: State,
) => {
    const url =
        process.env.DASHBOARD_URL ||
        'https://zero00-dashboard.onrender.com/api/dashboard/test'
    if (url) {
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-dashboard',
                            dat: {
                                dashboard: data,
                            },
                        },
                    })
                }
            })
            .catch((error: any) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-dashboard-err',
                            dat: error.message,
                        },
                    })
                }
            })
    } else {
        if (bal.slv != null) {
            bal.slv({ intBit: { idx: 'init-dashboard' } })
        }
    }
    return cpy
}

export const updateDashboard = (
    cpy: DashboardModel,
    bal: DashboardBit,
    ste: State,
) => {
    bal.slv({ intBit: { idx: 'update-dashboard' } })

    return cpy
}

export const testDashboard = (
    cpy: DashboardModel,
    bal: DashboardBit,
    ste: State,
) => {
    bal.slv({ mytBit: { idx: 'test-dashboard', val: 1 } })
    return cpy
}

export const listDashboard = async (
    cpy: DashboardModel,
    bal: DashboardBit,
    ste: State,
) => {
    const response = await dashboard.list()
    if (bal.slv != null)
        bal.slv({
            olmBit: {
                idx: 'list-dashboard',
                lst: response.models.map((m: any) => m.name),
            },
        })
    return cpy
}
