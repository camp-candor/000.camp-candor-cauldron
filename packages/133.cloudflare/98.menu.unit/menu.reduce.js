import clone from 'clone-deep';
import * as Act from './menu.action.js';
import { MenuModel } from './menu.model.js';
import * as Buzz from './menu.buzzer.js';
export function reducer(model = new MenuModel(), act, state) {
    switch (act.type) {
        case Act.UPDATE_MENU:
            return Buzz.updateMenu(clone(model), act.bale, state);
        case Act.DEPLOYMENT_MENU:
            return Buzz.deploymentMenu(clone(model), act.bale, state);
        case Act.INIT_MENU:
            return Buzz.initMenu(clone(model), act.bale, state);
        default:
            return model;
    }
}
