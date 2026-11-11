import HardwareBit, { RigIdentityType } from '../fce/hardware.bit.js'
import { HardwareModel } from '../hardware.model.js'
import State from '../../99.core/state.js'

export const selectHardwareProfile = async (
    cpy: HardwareModel,
    bal: HardwareBit,
    ste: State,
): Promise<HardwareModel> => {
    const options = [
        'RIG 1: Conductor (CPU / High RAM / Audio Clockmaster / Orchestrator)',
        'RIG 2: Foundry (GPU / High VRAM / PyTorch / Diffusion Worker)',
    ]

    if (bal.src) {
        const raw = bal.src.toUpperCase()
        cpy.selectedRig =
            raw.includes('RIG_2') || raw.includes('FOUNDRY')
                ? 'RIG_2_FOUNDRY'
                : 'RIG_1_CONDUCTOR'
    } else if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
        const choiceBit = await global.LIBRARY.hunt(
            '[Open action] Open Choice',
            {
                idx: 'choice-hardware',
                title: 'SELECT WORKSTATION HARDWARE PROFILE',
                lst: options,
            },
        )

        const chosen = choiceBit?.chcBit?.src || options[0]
        cpy.selectedRig = chosen.startsWith('RIG 2')
            ? 'RIG_2_FOUNDRY'
            : 'RIG_1_CONDUCTOR'
    } else {
        cpy.selectedRig = 'RIG_1_CONDUCTOR'
    }

    cpy.configuredAt = new Date().toISOString()

    if (global.LIBRARY && typeof global.LIBRARY.hunt === 'function') {
        try {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [HARDWARE] Profile selected: ${cpy.selectedRig}`,
            })
        } catch {
            // Non-blocking fallback
        }
    }

    if (bal.slv) {
        bal.slv({
            hrdBit: {
                idx: 'select-hardware',
                src: cpy.selectedRig,
                val: cpy.selectedRig === 'RIG_2_FOUNDRY' ? 2 : 1,
                dat: {
                    rig_identity: cpy.selectedRig,
                    configuredAt: cpy.configuredAt,
                },
            },
        })
    }
    return cpy
}
