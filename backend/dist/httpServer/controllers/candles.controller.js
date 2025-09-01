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
exports.getCandles = getCandles;
const schema_1 = require("../../db/schema");
;
function getCandles(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("request reaching from client");
        try {
            const { symbol, interval = "1m", limit = "100" } = req.query;
            if (!symbol) {
                return res.status(400).json({ error: "Symbol is required" });
            }
            const tableMap = {
                "1m": "md_candles_1m",
                "5m": 'md_candles_5m',
                "10m": "md_candles_10m",
                "30m": "md_candles_30m",
                "1h": "md_candles_1h",
                "1d": "md_candles_1d",
            };
            //pick the table based on interval
            const tableName = tableMap[String(interval)];
            //sql query with placeholders ($1, $2) to prevent SQL injection
            const query = `
            SELECT bucket,symbol, open, high, low, close, volume 
            FROM ${tableName} WHERE symbol =$1 ORDER BY bucket DESC 
            LIMIT $2`;
            const result = yield schema_1.pool.query(query, [symbol, Number(limit)]);
            const candles = result.rows.map((row) => ({
                time: row.bucket,
                symbol: row.symbol,
                open: Number(row.open),
                high: Number(row.high),
                low: Number(row.low),
                close: Number(row.close),
                volume: Number(row.volume)
            })).reverse();
            return res.json(candles);
        }
        catch (err) {
            console.error("getCandles error:", err);
            return res.status(500).json({ error: "interna; server error" });
        }
    });
}
