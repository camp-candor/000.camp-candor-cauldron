export type ContributorRoleType =
    'writer' | 'sound' | 'animator' | 'systems' | 'all'

export default interface RoleBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        role?: ContributorRoleType
        label?: string
        clusters?: string[]
    }
    slv?: Function
}
