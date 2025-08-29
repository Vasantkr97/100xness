import { createClient } from "redis";
import { WebSocketServer } from "ws";

const port:any = process.env.SUBSCRIBER_PORT || 8080;
const wss = new WebSocketServer({port});

//connect to redis server
const subscriber = createClient();

const StartSubscriber = async () => {
    await subscriber.connect();

    await subscriber.subscribe("tradeData", (subscribedData) => {
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

