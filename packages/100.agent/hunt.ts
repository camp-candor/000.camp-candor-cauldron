import State from './99.core/state.js'
import * as Import from './BEE.js'

var sim: any = {
    hunt: null,
    state: null,
}

var host = (obj: any, typ: string) => {
    init()

    var slv: (val?: any) => void
    const promo = new Promise((rslv) => (slv = rslv))

    if (obj == null) obj = {}
    if (obj.slv == null) obj.slv = (val0: any) => slv(val0)

    sim.state.dispatch({ type: typ, bale: obj })
    return promo
}

var init = () => {
    if (sim.state != null) return
    sim.state = new State()
    sim.state.pivot = sim
    sim.state.hunt = sim.hunt
    for (var k in Import.list) new Import.list[k](sim.state)
}

sim.hunt = (typ: string, obj?: any) => {
    return host(obj, typ)
}

export default sim
