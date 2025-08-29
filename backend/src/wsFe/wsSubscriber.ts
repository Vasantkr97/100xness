import { createClient } from "redis";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

//connect to redis server
const subscriber = createClient();

const StartSubscriber = async () => {
    await subscriber.connect();

    await subscriber.subscribe("tradeData", (subscribedData) => {
        console.log(subscribedData)
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(subscribedData)
            }

            if (client.readyState === WebSocket.CLOSED) {
                console.log("Client disconnected")
            }
        });

    })
};
StartSubscriber();

