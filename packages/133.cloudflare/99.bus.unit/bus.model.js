export class BusModel {
    MQTT;
    //idx:string;
    //busBitList: BusBit[] = [];
    //busBits: any = {};
    actList;
    client;
    host = 'mqtt://localhost:1883';
    bus;
    responseSuffix = '-response';
    promises = {};
}
