export type DriftStatusCode = 'ALIGNED' | 'DIRTY' | 'DRIFTED' | 'MISSING'

export interface RepoDriftRecord {
    repo: string
    cluster: string
    status: DriftStatusCode
    expected: string
    actual: string
}

export default interface DriftBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
