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
exports.saveTradedata = saveTradedata;
const schema_1 = require("./schema");
function saveTradedata(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        // Validate data
        if ([data.T, data.s, data.p, data.q, data.t, data.E].some(v => v == null)) {
            console.warn("Invalid trade data, skipping:", data);
            return;
        }
        const ts = new Date(data.T);
        const event_ts = new Date(data.E);
        // Check if timestamp is valid
        if (isNaN(ts.getTime()) || isNaN(event_ts.getTime())) {
            console.warn("Invalid timestamps, skipping trade:", data);
            return;
        }
        try {
            yield schema_1.pool.query(`INSERT INTO md_trades
            (ts, symbol, price, qty, agg_id, first_id, last_id, maker, event_ts, source)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT (symbol, agg_id, ts) DO NOTHING`, [
                ts,
                data.s,
                parseFloat(data.p),
                parseFloat(data.q),
                data.t,
                (_a = data.f) !== null && _a !== void 0 ? _a : null,
                (_b = data.l) !== null && _b !== void 0 ? _b : null,
                (_c = data.m) !== null && _c !== void 0 ? _c : null,
                event_ts,
                "binance",
            ]);
        }
        catch (err) {
            // Log detailed error info
            console.error("❌ Failed to save trade data:");
            console.error("Message:", err.message);
            if (err.detail)
                console.error("Detail:", err.detail);
            if (err.hint)
                console.error("Hint:", err.hint);
        }
    });
}
