export class FleetModel {
    idx: string = '07.fleet.unit'
    lastHydratedRole: string = ''
    hydratedRepos: string[] = []
    tombstonedClusters: string[] = []
    status: 'IDLE' | 'HYDRATING' | 'COMPLETE' | 'FAILED' = 'IDLE'
}
