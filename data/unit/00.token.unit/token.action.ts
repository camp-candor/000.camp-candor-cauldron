import { Action } from "../99.core/interface/action.interface";
import  TokenBit  from "./fce/token.bit";

// Token actions

export const INIT_TOKEN = "[Token action] Init Token";
export class InitToken implements Action {
 readonly type = INIT_TOKEN;
 constructor(public bale: TokenBit) {}
}

export const UPDATE_TOKEN = "[Token action] Update Token";
export class UpdateToken implements Action {
 readonly type = UPDATE_TOKEN;
 constructor(public bale: TokenBit) {}
}

export type Actions = | InitToken | UpdateToken ;
