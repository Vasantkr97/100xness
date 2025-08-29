import { pool } from "./schema";

export async function refreshCandles() {
    const client = await pool.connect();
    
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
                await client.query(`CALL refresh_continuous_aggregate('${table}', NULL, NULL)`);
                console.log(`✅ Refreshed ${table}`);
            } catch (err) {
                console.error(`❌ Failed to refresh ${table}:`, err);
            }
        }
        
        console.log("✅ All continuous aggregates refreshed!");
        
    } catch (err) {
        console.error("❌ Error refreshing candles:", err);
        throw err;
    } finally {
        client.release();
    }
}

// Function to check if data exists in tables
export async function checkDataExists() {
    const client = await pool.connect();
    
    try {
        console.log("🔍 Checking data in tables...");
        
        // Check md_trades
        const tradesResult = await client.query('SELECT COUNT(*) as count FROM md_trades');
        console.log(`📊 md_trades count: ${tradesResult.rows[0].count}`);
        
        // Check md_candles_1m
        const candlesResult = await client.query('SELECT COUNT(*) as count FROM md_candles_1m');
        console.log(`📊 md_candles_1m count: ${candlesResult.rows[0].count}`);
        
        // Show recent trades
        const recentTrades = await client.query(`
            SELECT ts, symbol, price, qty 
            FROM md_trades 
            ORDER BY ts DESC 
            LIMIT 5
        `);
        console.log("📈 Recent trades:", recentTrades.rows);
        
        // Show recent candles
        const recentCandles = await client.query(`
            SELECT bucket, symbol, open, high, low, close, volume 
            FROM md_candles_1m 
            ORDER BY bucket DESC 
            LIMIT 5
        `);
        console.log("📊 Recent candles:", recentCandles.rows);
        
    } catch (err) {
        console.error("❌ Error checking data:", err);
    } finally {
        client.release();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    (async () => {
        await checkDataExists();
        await refreshCandles();
        await checkDataExists();
        process.exit(0);
    })();
}
