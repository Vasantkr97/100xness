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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.schema = schema;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
// Enhanced pool error handling
exports.pool.on('connect', () => {
    console.log('New client connected to database');
});
exports.pool.on('error', (err) => {
    console.error('Database pool error:', err);
});
console.log("Database connection module loaded");
// Test the connection on module load
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("running schema migration..");
        yield schema();
        console.log("migration finished!");
    }
    catch (err) {
        //console.error("migration:", err)
    }
}))();
function schema() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield exports.pool.connect();
        try {
            yield client.query('BEGIN');
            yield client.query(`
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

            `);
            yield client.query(`
            --DO IT FOR 1min

            CREATE MATERIALIZED VIEW IF NOT EXISTS md_candles_1m 
            WITH (timescaledb.continuous) AS 
            SELECT 
                time_bucket(INTERVAL '1 minutes', ts) AS bucket, symbol,
                first(price, ts)    AS open,
                max(price)          AS high,
                min(price)          AS low,
                last(price, ts)     AS close,
                sum(qty)            AS volume
            FROM md_trades
            GROUP BY bucket, symbol
            WITH NO DATA;

            CREATE INDEX IF NOT EXISTS idx_md_candles_1m_symbol_bucket
                ON md_candles_1m(symbol, bucket DESC);


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
            

            --DO IT FOR 10min

            CREATE MATERIALIZED VIEW IF NOT EXISTS md_candles_10m 
            WITH (timescaledb.continuous) AS 
            SELECT 
                time_bucket(INTERVAL '10 minutes', ts) AS bucket, symbol,
                first(price, ts)    AS open,
                max(price)          AS high,
                min(price)          AS low,
                last(price, ts)     AS close,
                sum(qty)            AS volume
            FROM md_trades
            GROUP BY bucket, symbol
            WITH NO DATA;

            CREATE INDEX IF NOT EXISTS idx_md_candles_10m_symbol_bucket
                ON md_candles_10m(symbol, bucket DESC);


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
                ON md_candles_1d(symbol, bucket DESC);
        `);
            // checking refresh policy for each
            yield client.query(`
            -- 1-minute refresh policy for md_candles_1m
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM timescaledb_information.jobs j
                    WHERE j.proc_name = 'policy_refresh_continuous_aggregate'
                    AND j.hypertable_name = 'md_candles_1m'
                ) THEN
                    PERFORM add_continuous_aggregate_policy(
                        'md_candles_1m',
                        start_offset => INTERVAL '1 hour',        -- how far back to refresh
                        end_offset   => INTERVAL '1 minute',      -- stop 1 minute before now
                        schedule_interval => INTERVAL '1 minute'  -- refresh every 1 minute
                    );
                END IF;
            END$$;


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
                IF NOT EXISTS (
                    SELECT 1
                    FROM timescaledb_information.jobs j
                    WHERE j.proc_name = 'policy_refresh_continuous_aggregate'
                    AND j.hypertable_name = 'md_candles_10m'
                ) THEN
                    PERFORM add_continuous_aggregate_policy(
                        'md_candles_10m',
                        start_offset => INTERVAL '7 days',        -- refresh last 7 days
                        end_offset   => INTERVAL '5 minutes',     -- stop 5 minutes before now
                        schedule_interval => INTERVAL '10 minutes' -- refresh every 10 minutes
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
            yield client.query('COMMIT');
        }
        catch (err) {
            yield client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    });
}
