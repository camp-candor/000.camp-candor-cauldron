import { Action } from '../99.core/interface/action.interface'
import CompilationBit from './fce/compilation.bit'

// Compilation actions

export const INIT_COMPILATION = '[Compilation action] Init Compilation'
export class InitCompilation implements Action {
    readonly type = INIT_COMPILATION
    constructor(public bale: CompilationBit) {}
}

export const UPDATE_COMPILATION = '[Compilation action] Update Compilation'
export class UpdateCompilation implements Action {
    readonly type = UPDATE_COMPILATION
    constructor(public bale: CompilationBit) {}
}

export const RUN_MOCK_COMPILATION = '[Compilation action] Run Mock Compilation'
export class RunMockCompilation implements Action {
    readonly type = RUN_MOCK_COMPILATION
    constructor(public bale: CompilationBit) {}
}

export type Actions = InitCompilation | UpdateCompilation | RunMockCompilation
