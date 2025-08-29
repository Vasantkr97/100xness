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
const db_1 = require("./db");
function saveTradedata(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!data) {
            console.warn("⚠️ No data received for trade, skipping...");
            return;
        }
        const { T, s, p, q, t, E, m } = data;
        if (!T || !s || !p || !q || !t || !E) {
            console.warn("⚠️ Invalid trade data, skipping:", data);
            return;
        }
        const client = yield db_1.pool.connect();
        try {
            yield client.query(`INSERT INTO md_trades
            (ts, symbol, price, qty, agg_id, first_id, last_id, maker, event_ts, source)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
            ON CONFLICT (symbol, agg_id, ts) DO NOTHING`, [
                new Date(data.T),
                data.s,
                parseFloat(data.p),
                parseFloat(data.q),
                data.t,
                (_a = data.f) !== null && _a !== void 0 ? _a : null,
                (_b = data.l) !== null && _b !== void 0 ? _b : null,
                (_c = data.m) !== null && _c !== void 0 ? _c : null,
                new Date(data.E),
                "binance",
            ]);
            console.log("data saving to db saveTradedata.ts");
        }
        finally {
            client.release();
        }
    });
}
