import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;

export const tradeQueue = new Queue('trade-queue', {
    connection: {
        host: redisHost,
        port: redisPort,
    },
})

