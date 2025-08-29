import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});



// Enhanced pool error handling
pool.on('connect', () => {
    console.log('New client connected to database');
});

pool.on('error', (err) => {
    console.error('Database pool error:', err);
});

console.log("Database connection module loaded");

// Test the connection on module load
(async () => {
    try {
        console.log("running schema migration..")
        await schema();
        console.log("migration finished!")
    } catch (err) {
        console.error("migration:", err)
    }
})();

export async function schema() {
    const client = await pool.connect();

    try {
        console.log('Starting migration...')
        await client.query('BEGIN');
        await client.query(`
            CREATE EXTENSION IF NOT EXISTS timescaledb;

            CREATE TABLE IF NOT EXISTS md_trades (
                ts          timestamptz     NOT NULL,
                symbol      text            NOT NULL,
                price       double precision NOT NULL,
                qty         double precision NOT NULL,
                agg_id      bigint          NOT NULL,
                first_id    bigint,
                last_id     bigint,
                maker       boolean,
                event_ts    timestamptz,
                source      text            NOT NULL DEFAULT 'binance',
                PRIMARY KEY (symbol, agg_id, ts)
            );

            SELECT create_hypertable('md_trades','ts', if_not_exists => TRUE);

            CREATE INDEX IF NOT EXISTS idx_md_trades_symbol_ts ON md_trades(symbol, ts DESC);

            `)

        
        await client.query(`
            --DO IT FOR 5min

            CREATE MATERIALIZED VIEW IF NOT EXISTS md_candles_5m 
            WITH (timescaledb.continuous) AS 
            SELECT 
                time_bucket(INTERVAL '5 minutes', ts) AS bucket, symbol,
                first(price, ts)    AS open,
                max(price)          AS high,
                min(price)          AS low,
                last(price, ts)     AS close,
                sum(qty)            AS volume
            FROM md_trades
            GROUP BY bucket, symbol
            WITH NO DATA;

            CREATE INDEX IF NOT EXISTS idx_md_candles_5m_symbol_bucket
                ON md_candles_5m(symbol, bucket DESC);


            --DO IT FOR 30min
            
            CREATE MATERIALIZED VIEW IF NOT EXISTS md_candles_30m
            WITH (timescaledb.continuous) AS
            SELECT 
                time_bucket(INTERVAL '30 minutes', ts) AS bucket, symbol,
                first(price, ts)    AS open,
                max(price)          AS high,
                min(price)          AS low,
                last(price, ts)     AS close,
                sum(qty)            AS volume
            FROM md_trades
            GROUP BY bucket, symbol
            WITH NO DATA;

            CREATE INDEX IF NOT EXISTS idx_md_candles_30m_symbol_bucket
                ON md_candles_30m(symbol, bucket DESC);
            
            --DO IT FOR 1 hour

            CREATE MATERIALIZED VIEW IF NOT EXISTS md_candles_1h
            WITH (timescaledb.continuous) AS
            SELECT 
                time_bucket(INTERVAL '1 hour', ts) AS bucket, symbol,
                first(price, ts)    AS open,
                max(price)          AS high,
                min(price)          AS low,
                last(price, ts)     AS close,
                sum(qty)            AS volume
            FROM md_trades
            GROUP BY bucket, symbol
            WITH NO DATA;

            CREATE INDEX IF NOT EXISTS idx_md_candles_1h_symbol_bucket
                ON md_candles_1h(symbol, bucket DESC);
            
            
            --DO IT FOR 1 day

            CREATE MATERIALIZED VIEW IF NOT EXISTS md_candles_1d
            WITH (timescaledb.continuous) AS
            SELECT 
                time_bucket(INTERVAL '1 day', ts) AS bucket, symbol,
                first(price, ts)        AS open,
                max(price)              AS high,
                min(price)              AS low,
                last(price, ts)         AS close,
                sum(qty)                AS volume
            FROM md_trades
            GROUP BY bucket, symbol
            WITH NO DATA;

            CREATE INDEX IF NOT EXISTS idx_md_candles_1d_symbol_bucket
                ON md_candles_1d(symbol,  bucket DESC)
        `);

        // checking refresh policy for each
        await client.query(`
            DO $$
            BEGIN 
                PERFORM 1
                FROM timescaledb_information.jobs j
                WHERE j.proc_name = 'policy_refresh_continuous_aggregate'
                    AND j.hypertable_name = 'md_candles_5m';
                IF NOT FOUND THEN
                    PERFORM add_continuous_aggregate_policy(
                    'md_candles_5m',
                    start_offset => INTERVAL '2 days',
                    end_offset   => INTERVAL '1 minute',
                    schedule_interval => INTERVAL '1 minute'
                );
                END IF;
            END$$;


            DO $$
            BEGIN 
                PERFORM 1
                FROM timescaledb_information.jobs j
                WHERE j.proc_name = 'policy_refresh_continuous_aggregate'
                    AND j.hypertable_name = 'md_candles_30m';
                IF NOT FOUND THEN
                    PERFORM add_continuous_aggregate_policy(
                    'md_candles_30m',
                    start_offset => INTERVAL '7 days',
                    end_offset   => INTERVAL '5 minutes',
                    schedule_interval => INTERVAL '5 minutes'
                );
                END IF;
            END$$;

            DO $$
            BEGIN 
                PERFORM 1
                FROM timescaledb_information.jobs j
                WHERE j.proc_name = 'policy_refresh_continuous_aggregate'
                    AND j.hypertable_name = 'md_candles_1h';
                IF NOT FOUND THEN
                    PERFORM add_continuous_aggregate_policy(
                    'md_candles_1h',
                    start_offset => INTERVAL '30 days',
                    end_offset   => INTERVAL '15 minutes',
                    schedule_interval => INTERVAL '15 minutes'
                );
                END IF;
            END$$;

            DO $$
            BEGIN 
                PERFORM 1
                FROM timescaledb_information.jobs j
                WHERE j.proc_name = 'policy_refresh_continuous_aggregate'
                    AND j.hypertable_name = 'md_candles_1d';
                IF NOT FOUND THEN
                    PERFORM add_continuous_aggregate_policy(
                    'md_candles_1d',
                    start_offset => INTERVAL '180 days',
                    end_offset   => INTERVAL '1 hour',
                    schedule_interval => INTERVAL '1 hour'
                );
                END IF;
            END$$;
        `);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
