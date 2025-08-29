import { pool } from "./schema";

type BinanceTrade = {
    e: string;
    E: number;
    s: string;
    t: number;
    p: string;
    q: string;
    T: number;
    m: boolean;
    M: boolean;
    f?: number;
    l?: number;
};

export async function saveTradedata(data: BinanceTrade) {
    console.log("💾 Saving trade data:", data);

    // Validate data
    if ([data.T, data.s, data.p, data.q, data.t, data.E].some(v => v == null)) {
        console.warn("Invalid trade data, skipping:", data);
        return;
    }

    const ts = new Date(data.T);
    const event_ts = new Date(data.E);

    // Check if timestamp is valid
    if (isNaN(ts.getTime()) || isNaN(event_ts.getTime())) {
        console.warn("⚠️ Invalid timestamps, skipping trade:", data);
        return;
    }

    try {
        console.log(`Inserting trade into md_trades (ts: ${ts.toISOString()}, symbol: ${data.s})`);

        await pool.query(
            `INSERT INTO md_trades
            (ts, symbol, price, qty, agg_id, first_id, last_id, maker, event_ts, source)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT (symbol, agg_id, ts) DO NOTHING`,
            [
                ts,
                data.s,
                parseFloat(data.p),
                parseFloat(data.q),
                data.t,
                data.f ?? null,
                data.l ?? null,
                data.m ?? null,
                event_ts,
                "binance",
            ]
        );

        console.log("✅ Trade data saved successfully");

    } catch (err: any) {
        // Log detailed error info
        console.error("❌ Failed to save trade data:");
        console.error("Message:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
        if (err.hint) console.error("Hint:", err.hint);
    }
}
