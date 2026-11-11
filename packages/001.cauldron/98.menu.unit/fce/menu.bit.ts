export interface MenuChoiceItem {
    name: string
    actionKey: string
    tooltip: string
}

export default interface MenuBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: Function
}
