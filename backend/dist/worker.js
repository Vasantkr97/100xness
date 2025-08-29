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
exports.tradeWorker = void 0;
const bullmq_1 = require("bullmq");
const redisConfig_1 = require("./redisConfig");
const saveTradedata_1 = require("./pool/saveTradedata");
// const prisma = new PrismaClient();
exports.tradeWorker = new bullmq_1.Worker("trade-queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const data = job;
    console.log("✅ Saved trade to DB:", data);
    yield (0, saveTradedata_1.saveTradedata)(data);
}), {
    connection: redisConfig_1.redisConfig
});
exports.tradeWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
exports.tradeWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job === null || job === void 0 ? void 0 : job.id} failed:`, err);
});
