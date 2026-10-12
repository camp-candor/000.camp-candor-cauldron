import * as ActCol from '../../97.collect.unit/collect.action.js';
import * as ActPrj from '../../01.project.unit/project.action.js';
var bit, dat;
export const initProject = (cpy, bal, ste) => {
    return cpy;
};
export const updateProject = (cpy, bal, ste) => {
    bal.slv({ prjBit: { idx: 'update-project' } });
    return cpy;
};
export const readProject = async (cpy, bal, ste) => {
    if (bal.idx == null)
        bal.idx = 'prj00';
    bit = await ste.hunt(ActCol.READ_COLLECT, { idx: bal.idx, bit: ActPrj.CREATE_PROJECT });
    bal.slv({ prjBit: { idx: 'read-project', dat: bit.clcBit.dat } });
    return cpy;
};
export const writeProject = async (cpy, bal, ste) => {
    if (bal.dat == null)
        bal.dat = {};
    bit = await ste.hunt(ActCol.WRITE_COLLECT, { idx: bal.idx, dat: bal.dat, bit: ActPrj.CREATE_PROJECT });
    dat = bit.clcBit.dat;
    bal.slv({ prjBit: { idx: 'write-project', dat } });
    return cpy;
};
export const removeProject = async (cpy, bal, ste) => {
    bit = await ste.hunt(ActCol.REMOVE_COLLECT, { idx: bal.idx, bit: ActPrj.DELETE_PROJECT });
    bal.slv({ prjBit: { idx: 'remove-project', dat: bit.clcBit.dat } });
    return cpy;
};
export const deleteProject = (cpy, bal, ste) => {
    bal.slv({ prjBit: { idx: 'delete-project' } });
    return cpy;
};
export const createProject = (cpy, bal, ste) => {
    if (bal.dat == null)
        bal.dat = {};
    var prjBit = { idx: bal.idx, src: bal.dat.src };
    bal.slv({ prjBit: { idx: 'create-project', dat: prjBit } });
    return cpy;
};
