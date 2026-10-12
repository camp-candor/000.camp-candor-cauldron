import { BehaviorSubject } from 'rx-lite';
import { Subject } from 'rx-lite';
import UnitModel from '../BEE.js';
import * as Effect from '../BEE.js';
export default class State extends BehaviorSubject {
    hunt;
    value;
    pivot;
    bus;
    dispatcher = new Subject();
    constructor(init = new UnitModel()) {
        super(init);
        this.dispatcher
            .scan((state, action) => this.reducedApp(state, action), init)
            .subscribe((state) => {
            super.onNext(state);
        });
    }
    reducedApp(nextState, key) {
        for (var k in Effect.reducer)
            Effect.reducer[k](nextState[k], key, this);
        return nextState;
    }
    dispatch(value) {
        var result = this.dispatcher.onNext(value);
        return result;
    }
    pat(value) {
        this.dispatch(value);
    }
    next(value) {
        this.dispatcher.onNext(value);
    }
}
