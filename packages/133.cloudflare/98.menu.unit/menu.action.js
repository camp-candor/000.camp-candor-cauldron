export const INIT_MENU = '[Menu action] Init Menu';
export class InitMenu {
    bale;
    type = INIT_MENU;
    constructor(bale) {
        this.bale = bale;
    }
}
export const UPDATE_MENU = '[Menu action] Update Menu';
export class UpdateMenu {
    bale;
    type = UPDATE_MENU;
    constructor(bale) {
        this.bale = bale;
    }
}
export const DEPLOYMENT_MENU = '[Menu action] Deployment Menu';
export class DeploymentMenu {
    bale;
    type = DEPLOYMENT_MENU;
    constructor(bale) {
        this.bale = bale;
    }
}
