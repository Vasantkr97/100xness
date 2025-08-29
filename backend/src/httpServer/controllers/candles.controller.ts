import { pool } from "../../db/schema";

interface Candle {
    time: Date;      //bucket
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};


export async function getCandles(req: any, res: any) {
    console.log("request reaching from postman")
    try {
        const { symbol, interval = "5m", limit="100" }= req.body;

        if (!symbol) {
            return res.status(400).json({ error: "Symbol is required"});
        }

        const tableMap: Record<string, string> = {
            "5m" : 'md_candles_5m',
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
        
        const result = await pool.query(query, [symbol, Number(limit)]);

        const candles: Candle[] = result.rows.map((row) => ({
            time: row.bucket,
            symbol: row.symbol,
            open: Number(row.open),
            high: Number(row.high),
            low: Number(row.low),
            close: Number(row.close),
            volume: Number(row.volume)
        })).reverse();

        return res.json(candles);

    } catch(err) {
        console.error("getCandles error:", err);
        return res.status(500).json({ error: "interna; server error"});
    }
}