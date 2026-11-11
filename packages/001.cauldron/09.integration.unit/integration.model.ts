import { SubsystemValidationResult } from './fce/integration.bit.js'

export class IntegrationModel {
    idx: string = '09.integration.unit'
    allPassed: boolean = false
    results: SubsystemValidationResult | null = null
    executedAt: string = ''
}
