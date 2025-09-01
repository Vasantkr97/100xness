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
const worker_1 = require("./uploader/worker");
console.log("🚀 Starting trade worker...");
// Enable error handling
worker_1.tradeWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});
worker_1.tradeWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job === null || job === void 0 ? void 0 : job.id} failed:`, err);
});
worker_1.tradeWorker.on("error", (err) => {
    console.error("❌ Worker error:", err);
});
console.log("✅ Trade worker started and listening for jobs...");
// Keep the process alive
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down worker...');
    yield worker_1.tradeWorker.close();
    process.exit(0);
}));
