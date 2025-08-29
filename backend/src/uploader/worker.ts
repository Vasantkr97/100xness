import { Worker } from "bullmq";
import { saveTradedata } from "../db/saveTradedata";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;

// Add this to the top of your worker.ts or create a separate test file
import { pool } from "../db/schema";

async function testConnection() {
    try {
        console.log("Testing database connection...");
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        
        // Don't log the full URL for security, just check if it exists
        if (process.env.DATABASE_URL) {
            const url = new URL(process.env.DATABASE_URL);
            console.log("Database host:", url.hostname);
            console.log("Database port:", url.port);
            console.log("Database name:", url.pathname.slice(1));
            console.log("Username:", url.username);
            console.log("Password length:", url.password ? url.password.length : 0);
        }
        
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log("✅ Connection successful:", result.rows[0]);
        client.release();
    } catch (err) {
        console.error("❌ Connection failed:", err);
    }
}

// Call this function to test
testConnection();


export const tradeWorker = new Worker(
    "trade-queue",
    async (job) => {
        const data = job.data;
        await saveTradedata(data);
    },
    {
        connection: {
        host: redisHost,
        port: redisPort,
    },
    }
);

tradeWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

tradeWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});

tradeWorker.on("error", (err) => {
    console.error("❌ Worker error:", err);
});