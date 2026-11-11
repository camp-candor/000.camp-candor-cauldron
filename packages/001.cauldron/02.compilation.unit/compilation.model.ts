import { MockCompilationSummary } from './fce/compilation.bit.js'

export class CompilationModel {
    idx: string = '02.compilation.unit'
    lastRunSummary: MockCompilationSummary | null = null
    isBusy: boolean = false
}
