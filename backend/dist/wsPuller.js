"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const redis_1 = require("redis");
const queue_1 = require("./uploader/queue");
//call schema.ts once app getting started
// const schema_ts = async () => {
//    try {
//       await schema();
//    } catch (err) {
//       console.log("failed to inilialize schema", err);
//    }
// }
// schema_ts()
const ws = new ws_1.WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade
`);
let publisher;
const startPublisher = () => __awaiter(void 0, void 0, void 0, function* () {
    publisher = (0, redis_1.createClient)();
    yield publisher.connect();
});
startPublisher();
//Client WS
ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = JSON.parse(message.toString());
    const data = parsedData.data;
    //Adding trade to redis queue
    yield queue_1.tradeQueue.add("trade-queue", data);
    //Publish trade data to redis pub/sub channel(tradeData)
    yield publisher.publish("tradeData", JSON.stringify(data));
}));
