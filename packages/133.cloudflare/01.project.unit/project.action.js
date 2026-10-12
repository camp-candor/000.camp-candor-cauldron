export const INIT_PROJECT = '[Project action] Init Project';
export class InitProject {
    bale;
    type = INIT_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const WRITE_PROJECT = '[Project action] Write Project';
export class WriteProject {
    bale;
    type = WRITE_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const UPDATE_PROJECT = '[Project action] Update Project';
export class UpdateProject {
    bale;
    type = UPDATE_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const CREATE_PROJECT = '[Project action] Create Project';
export class CreateProject {
    bale;
    type = CREATE_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const READ_PROJECT = '[Project action] Read Project';
export class ReadProject {
    bale;
    type = READ_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const DELETE_PROJECT = '[Project action] Delete Project';
export class DeleteProject {
    bale;
    type = DELETE_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
export const REMOVE_PROJECT = '[Project action] Remove Project';
export class RemoveProject {
    bale;
    type = REMOVE_PROJECT;
    constructor(bale) {
        this.bale = bale;
    }
}
