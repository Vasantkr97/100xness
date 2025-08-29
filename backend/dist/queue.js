"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeQueue = void 0;
const bullmq_1 = require("bullmq");
const redisConfig_1 = require("./redisConfig");
exports.tradeQueue = new bullmq_1.Queue("trade-queue", {
    connection: redisConfig_1.redisConfig
});
