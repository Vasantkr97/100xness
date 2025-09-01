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
const redis_1 = require("redis");
const ws_1 = require("ws");
const port = process.env.SUBSCRIBER_PORT || 8080;
const wss = new ws_1.WebSocketServer({ port });
//connect to redis server
const subscriber = (0, redis_1.createClient)();
const StartSubscriber = () => __awaiter(void 0, void 0, void 0, function* () {
    yield subscriber.connect();
    yield subscriber.subscribe("tradeData", (subscribedData) => {
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(subscribedData);
            }
            if (client.readyState === WebSocket.CLOSED) {
                console.log("Client disconnected");
            }
        });
    });
});
StartSubscriber();
