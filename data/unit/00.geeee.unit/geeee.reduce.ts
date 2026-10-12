import clone from "clone-deep";
import * as Act from "./geeee.action";
import { GeeeeModel } from "./geeee.model";
import * as Buzz from "./geeee.buzzer";
import State from "../99.core/state";

export function reducer(model: GeeeeModel = new GeeeeModel(), act: Act.Actions,  state?: State ) {
 switch (act.type) {
 
 case Act.UPDATE_GEEEE:
 return Buzz.updateGeeee(clone(model), act.bale, state);

 case Act.INIT_GEEEE:
 return Buzz.initGeeee(clone(model), act.bale, state);

 default:
 return model;
 }
}
