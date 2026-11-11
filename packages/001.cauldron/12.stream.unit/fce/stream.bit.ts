export default interface StreamBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        command?: string
        args?: string[]
        cwd?: string
        prefix?: string
    }
    slv?: Function
}
