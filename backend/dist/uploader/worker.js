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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeWorker = void 0;
const bullmq_1 = require("bullmq");
const saveTradedata_1 = require("../db/saveTradedata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
// Add this to the top of your worker.ts or create a separate test file
const schema_1 = require("../db/schema");
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const client = yield schema_1.pool.connect();
            const result = yield client.query('SELECT NOW()');
            console.log("✅ Connection successful:", result.rows[0]);
            client.release();
        }
        catch (err) {
            console.error("❌ Connection failed:", err);
        }
    });
}
// Call this function to test
testConnection();
exports.tradeWorker = new bullmq_1.Worker("trade-queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const data = job.data;
    yield (0, saveTradedata_1.saveTradedata)(data);
}), {
    connection: {
        host: redisHost,
        port: redisPort,
    },
});
// tradeWorker.on("completed", (job) => {
//     console.log(`✅ Job ${job.id} completed successfully`);
// });
// tradeWorker.on("failed", (job, err) => {
//     console.error(`❌ Job ${job?.id} failed:`, err);
// });
// tradeWorker.on("error", (err) => {
//     console.error("❌ Worker error:", err);
// });
