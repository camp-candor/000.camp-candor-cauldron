// Deployment actions
export const INIT_DEPLOYMENT = '[Deployment action] Init Deployment';
export class InitDeployment {
    bale;
    type = INIT_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const UPDATE_DEPLOYMENT = '[Deployment action] Update Deployment';
export class UpdateDeployment {
    bale;
    type = UPDATE_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const LIST_DEPLOYMENT = '[List action] List Deployment';
export class ListDeployment {
    bale;
    type = LIST_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const DELETE_DEPLOYMENT = '[Delete action] Delete Deployment';
export class DeleteDeployment {
    bale;
    type = DELETE_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const TEST_DEPLOYMENT = '[Test action] Test Deployment';
export class TestDeployment {
    bale;
    type = TEST_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const CURRENT_DEPLOYMENT = '[Current action] Current Deployment';
export class CurrentDeployment {
    bale;
    type = CURRENT_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const WIPE_DEPLOYMENT = '[Wipe action] Wipe Deployment';
export class WipeDeployment {
    bale;
    type = WIPE_DEPLOYMENT;
    constructor(bale) {
        this.bale = bale;
    }
}
