import { MenuChoiceItem } from './fce/menu.bit.js'

export class MenuModel {
    idx: string = '98.menu.unit'
    activeSelection: string = ''
    lastActionTimestamp: string = ''
    isProcessing: boolean = false
    choices: MenuChoiceItem[] = [
        {
            name: 'RUN CAULDRON DOCTOR',
            actionKey: 'RUN_DOCTOR',
            tooltip:
                'Probe host Node.js engine, ffprobe binary, and viewport RAM footprint',
        },
        {
            name: 'CONFIGURE HARDWARE RIG',
            actionKey: 'CONFIG_RIG',
            tooltip:
                'Demarcate Rig 1 Conductor (CPU) vs Rig 2 Foundry (GPU) and write cauldron.config.json',
        },
        {
            name: 'HYDRATE FLEET WORKSPACE',
            actionKey: 'HYDRATE_FLEET',
            tooltip:
                'Execute role-based shallow blobless Git hydration with cluster tombstones',
        },
        {
            name: 'AUDIT VERSIONS.JSON',
            actionKey: 'AUDIT_VERSIONS',
            tooltip:
                'Evaluate multi-repo commit drift and display 4-state ASCII status table',
        },
        {
            name: 'RUN ZERO-COST MOCK DEMO',
            actionKey: 'MOCK_DEMO',
            tooltip:
                'Compile starter episode using CPU SwiftShader software OpenGL (--gl=swangle)',
        },
        {
            name: 'ROOT MENU',
            actionKey: 'ROOT_MENU',
            tooltip: 'Return to Showrunner primary root navigation switchboard',
        },
    ]
}
