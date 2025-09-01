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
exports.refreshCandles = refreshCandles;
exports.checkDataExists = checkDataExists;
const schema_1 = require("./schema");
function refreshCandles() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield schema_1.pool.connect();
        try {
            console.log("🔄 Refreshing continuous aggregates...");
            // Refresh all candle tables
            const candleTables = [
                'md_candles_1m',
                'md_candles_5m',
                'md_candles_10m',
                'md_candles_30m',
                'md_candles_1h',
                'md_candles_1d'
            ];
            for (const table of candleTables) {
                try {
                    yield client.query(`CALL refresh_continuous_aggregate('${table}', NULL, NULL)`);
                    console.log(`✅ Refreshed ${table}`);
                }
                catch (err) {
                    console.error(`❌ Failed to refresh ${table}:`, err);
                }
            }
            console.log("✅ All continuous aggregates refreshed!");
        }
        catch (err) {
            console.error("❌ Error refreshing candles:", err);
            throw err;
        }
        finally {
            client.release();
        }
    });
}
// Function to check if data exists in tables
function checkDataExists() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield schema_1.pool.connect();
        try {
            console.log("🔍 Checking data in tables...");
            // Check md_trades
            const tradesResult = yield client.query('SELECT COUNT(*) as count FROM md_trades');
            console.log(`📊 md_trades count: ${tradesResult.rows[0].count}`);
            // Check md_candles_1m
            const candlesResult = yield client.query('SELECT COUNT(*) as count FROM md_candles_1m');
            console.log(`📊 md_candles_1m count: ${candlesResult.rows[0].count}`);
            // Show recent trades
            const recentTrades = yield client.query(`
            SELECT ts, symbol, price, qty 
            FROM md_trades 
            ORDER BY ts DESC 
            LIMIT 5
        `);
            console.log("📈 Recent trades:", recentTrades.rows);
            // Show recent candles
            const recentCandles = yield client.query(`
            SELECT bucket, symbol, open, high, low, close, volume 
            FROM md_candles_1m 
            ORDER BY bucket DESC 
            LIMIT 5
        `);
            console.log("📊 Recent candles:", recentCandles.rows);
        }
        catch (err) {
            console.error("❌ Error checking data:", err);
        }
        finally {
            client.release();
        }
    });
}
// Run if this file is executed directly
if (require.main === module) {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        yield checkDataExists();
        yield refreshCandles();
        yield checkDataExists();
        process.exit(0);
    }))();
}
