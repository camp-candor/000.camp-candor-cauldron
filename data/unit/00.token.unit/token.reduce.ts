import clone from "clone-deep";
import * as Act from "./token.action";
import { TokenModel } from "./token.model";
import * as Buzz from "./token.buzzer";
import State from "../99.core/state";

export function reducer(model: TokenModel = new TokenModel(), act: Act.Actions,  state?: State ) {
 switch (act.type) {
 
 case Act.UPDATE_TOKEN:
 return Buzz.updateToken(clone(model), act.bale, state);

 case Act.INIT_TOKEN:
 return Buzz.initToken(clone(model), act.bale, state);

 default:
 return model;
 }
}
