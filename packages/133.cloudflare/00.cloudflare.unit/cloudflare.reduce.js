import clone from 'clone-deep';
import * as Act from './cloudflare.action.js';
import { CloudflareModel } from './cloudflare.model.js';
import * as Buzz from './cloudflare.buzzer.js';
export function reducer(model = new CloudflareModel(), act, state) {
    switch (act.type) {
        case Act.UPDATE_CLOUDFLARE:
            return Buzz.updateCloudflare(clone(model), act.bale, state);
        case Act.INIT_CLOUDFLARE:
            return Buzz.initCloudflare(clone(model), act.bale, state);
        case Act.TEST_CLOUDFLARE:
            return Buzz.testCloudflare(clone(model), act.bale, state);
        case Act.LIST_CLOUDFLARE:
            return Buzz.listCloudflare(clone(model), act.bale, state);
        case Act.PROJECT_CLOUDFLARE:
            return Buzz.projectCloudflare(clone(model), act.bale, state);
        default:
            return model;
    }
}
