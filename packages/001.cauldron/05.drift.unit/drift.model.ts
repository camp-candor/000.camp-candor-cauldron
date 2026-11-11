import { RepoDriftRecord } from './fce/drift.bit.js'

export class DriftModel {
    idx: string = '05.drift.unit'
    lastEvaluatedAt: string = ''
    records: RepoDriftRecord[] = []
    hasDrift: boolean = false
}
