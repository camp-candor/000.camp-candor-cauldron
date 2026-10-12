import { Action } from "../99.core/interface/action.interface";
import  GeeeeBit  from "./fce/geeee.bit";

// Geeee actions

export const INIT_GEEEE = "[Geeee action] Init Geeee";
export class InitGeeee implements Action {
 readonly type = INIT_GEEEE;
 constructor(public bale: GeeeeBit) {}
}

export const UPDATE_GEEEE = "[Geeee action] Update Geeee";
export class UpdateGeeee implements Action {
 readonly type = UPDATE_GEEEE;
 constructor(public bale: GeeeeBit) {}
}

export type Actions = | InitGeeee | UpdateGeeee ;
