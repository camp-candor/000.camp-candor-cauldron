import { CauldronConfigFile } from './fce/config.bit.js'

export class ConfigModel {
    idx: string = '03.config.unit'
    activeDay: string = '002'
    directiveLedgerPath: string = ''
    lastStampedSpec: any = null
    lastStampedConfig: CauldronConfigFile | null = null
}
