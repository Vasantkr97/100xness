import { WebSocket } from "ws";

import { createClient } from "redis";
import { tradeQueue } from "./uploader/queue";

 const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade
`);

let publisher: any;

const startPublisher = async () => {
   publisher = createClient();
   await publisher.connect()
};

startPublisher();

//Client WS
 ws.on('message', async (message: any) => {
   const parsedData = JSON.parse(message.toString())
   const data = parsedData.data;

    //Adding trade to redis queue
   await tradeQueue.add("trade-queue", data);

   //Publish trade data to redis pub/sub channel(tradeData)
   await publisher.publish("tradeData", JSON.stringify(data))

 })