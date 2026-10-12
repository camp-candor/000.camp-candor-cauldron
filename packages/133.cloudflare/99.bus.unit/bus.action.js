// Bus actions
export const INIT_BUS = '[Bus action] Init Bus';
export class InitBus {
    bale;
    type = INIT_BUS;
    constructor(bale) {
        this.bale = bale;
    }
}
export const OPEN_BUS = '[Bus action] Open Bus';
export class OpenBus {
    bale;
    type = OPEN_BUS;
    constructor(bale) {
        this.bale = bale;
    }
}
export const CONNECT_BUS = '[Bus action] Connect Bus';
export class ConnectBus {
    bale;
    type = CONNECT_BUS;
    constructor(bale) {
        this.bale = bale;
    }
}
export const MESSAGE_BUS = '[Bus action] Message Bus';
export class MessageBus {
    bale;
    type = MESSAGE_BUS;
    constructor(bale) {
        this.bale = bale;
    }
}
export const UPDATE_BUS = '[Bus action] Update Bus';
export class UpdateBus {
    bale;
    type = UPDATE_BUS;
    constructor(bale) {
        this.bale = bale;
    }
}
export const CREATE_BUS = '[Bus action] Create Bus';
export class CreateBus {
    bale;
    type = CREATE_BUS;
    constructor(bale) {
        this.bale = bale;
    }
}
