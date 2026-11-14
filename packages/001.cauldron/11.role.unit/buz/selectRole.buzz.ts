import RoleBit, { ContributorRoleType } from '../fce/role.bit.js'
import { RoleModel } from '../role.model.js'
import State from '../../99.core/state.js'

export const selectContributorRole = async (
    cpy: RoleModel,
    bal: RoleBit,
    ste: State,
): Promise<RoleModel> => {
    const roleChoices = [
        'WRITER   (01.canon, 02.simulation)',
        'SOUND    (Audio microservices, stems, ffprobe quantizer)',
        'ANIMATOR (Remotion optical composition, templates, assets)',
        'SYSTEMS  (Simulation conductors, duel engines, sentinels)',
        'ALL      (Full studio cluster hydration)',
    ]

    if (bal.src) {
        const rawRole = bal.src.toLowerCase() as ContributorRoleType
        cpy.activeRole = [
            'writer',
            'sound',
            'animator',
            'systems',
            'all',
        ].includes(rawRole)
            ? rawRole
            : 'systems'
    } else if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
        const gridBit = await global.LIBRARY.hunt('[Grid action] Update Grid', {
            x: 0,
            y: 4,
            xSpan: 4,
            ySpan: 8,
        })
        const choiceBit = await global.LIBRARY.hunt(
            '[Open action] Open Choice',
            {
                idx: 'choice-role',
                title: 'SELECT CONTRIBUTOR HYDRATION ROLE MASK',
                dat: { clr0: 'black', clr1: 'yellow' },
                src: 'vertical',
                lst: roleChoices,
                net: gridBit?.grdBit?.dat,
            },
        )

        const chosen = choiceBit?.chcBit?.src || roleChoices[3]
        const key = chosen.split(' ')[0].toLowerCase() as ContributorRoleType
        cpy.activeRole = key
    } else {
        cpy.activeRole = 'systems'
    }

    cpy.selectedAt = new Date().toISOString()

    if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
        try {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [ROLE] Active contributor role set to: ${cpy.activeRole.toUpperCase()}`,
            })
        } catch {
            // Non-blocking fallback
        }
    }

    if (bal.slv) {
        bal.slv({
            rleBit: {
                idx: 'select-role',
                src: cpy.activeRole,
                dat: { role: cpy.activeRole, timestamp: cpy.selectedAt },
            },
        })
    }
    return cpy
}
