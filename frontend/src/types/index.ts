import type { UTCTimestamp } from "lightweight-charts";

// Trade data interface
export interface TradeData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is buyer market maker
  M: boolean; // Ignore
}

// Enhanced price data interface for current prices
export interface CurrentPriceData {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  lastUpdate: number;
  volume24h?: number;
}

// Enhanced candlestick data interface
export interface CandlestickDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Time interval configuration - matches database materialized views
export const TIME_INTERVALS = {
  '1m': 60,
  '5m': 300,
  '10m': 600,
  '30m': 1800,
  '1h': 3600,
  '1d': 86400
} as const;

export type TimeInterval = keyof typeof TIME_INTERVALS;
