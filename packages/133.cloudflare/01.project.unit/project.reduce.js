import clone from 'clone-deep';
import * as Act from './project.action.js';
import { ProjectModel } from './project.model.js';
import * as Buzz from './project.buzzer.js';
export function reducer(model = new ProjectModel(), act, state) {
    switch (act.type) {
        case Act.REMOVE_PROJECT:
            return Buzz.removeProject(clone(model), act.bale, state);
        case Act.DELETE_PROJECT:
            return Buzz.deleteProject(clone(model), act.bale, state);
        case Act.READ_PROJECT:
            return Buzz.readProject(clone(model), act.bale, state);
        case Act.WRITE_PROJECT:
            return Buzz.writeProject(clone(model), act.bale, state);
        case Act.CREATE_PROJECT:
            return Buzz.createProject(clone(model), act.bale, state);
        case Act.UPDATE_PROJECT:
            return Buzz.updateProject(clone(model), act.bale, state);
        case Act.INIT_PROJECT:
            return Buzz.initProject(clone(model), act.bale, state);
        default:
            return model;
    }
}
