import { DiagnosticReportItem } from './fce/doctor.bit.js'

export class DoctorModel {
    idx: string = '04.doctor.unit'
    lastRunPassed: boolean = false
    reports: DiagnosticReportItem[] = []
    evaluatedAt: string = ''
}
