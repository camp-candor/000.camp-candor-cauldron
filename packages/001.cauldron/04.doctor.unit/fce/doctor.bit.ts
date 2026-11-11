export interface DiagnosticReportItem {
    id: string
    name: string
    status: 'PASS' | 'WARN' | 'FAIL'
    details: string
}

export default interface DoctorBit {
    idx: string
    src?: string
    val?: number
    dat?: DiagnosticReportItem | DiagnosticReportItem[] | any
    slv?: Function
}
