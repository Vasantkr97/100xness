import React, { useState, useRef, useEffect, useCallback } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import axios from "axios";
import SimpleChart from "./SimpleChart";

// Trade data interface
interface TradeData {
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
interface CurrentPriceData {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  lastUpdate: number;
  volume24h?: number;
}

// Enhanced candlestick data interface
interface CandlestickDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Time interval configuration - matches database materialized views
const TIME_INTERVALS = {
  '1m': 60,
  '5m': 300,
  '10m': 600,
  '30m': 1800,
  '1h': 3600,
  '1d': 86400
} as const;

type TimeInterval = keyof typeof TIME_INTERVALS;

// Enhanced fetch function with better error handling and caching
const fetchCandlestickData = async (
  symbol: string,
  interval: TimeInterval,
  limit: number = 100
): Promise<CandlestickDataPoint[]> => {
  try {
    console.log(`🔄 Fetching ${interval} candlestick data for ${symbol}...`);
    
    const response = await axios.get(`/api/candles/getCandles`, {
      params: {
        symbol,
        interval,
        limit
      },
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Response:", response.data);

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from server");
    }

    // Transform data for chart format
    const transformedData: CandlestickDataPoint[] = response.data
      .map((item: any, index: number) => {
        if (!item.time || item.open === undefined || item.high === undefined || 
            item.low === undefined || item.close === undefined) {
          console.warn(`⚠️ Invalid data item at index ${index}:`, item);
          return null;
        }

        return {
          time: Math.floor(new Date(item.time).getTime() / 1000) as UTCTimestamp,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume || 0)
        };
      })
      .filter((item): item is CandlestickDataPoint => item !== null);

    if (transformedData.length === 0) {
      throw new Error("No valid candlestick data received from server");
    }

    console.log(`📊 Processed ${transformedData.length} candlesticks`);
    return transformedData;

  } catch (err: any) {
    console.error("❌ Error fetching candlestick data:", err);
    
    let errorMessage = "Failed to fetch chart data.";
    
    if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Server might be slow.";
    } else if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
      errorMessage = "Cannot connect to server. Please check if the server is running.";
    } else if (err.response) {
      const status = err.response.status;
      const data = err.response.data;
      
      switch (status) {
        case 400:
          errorMessage = `Bad Request: ${data.error || "Invalid parameters"}`;
          break;
        case 404:
          errorMessage = "API endpoint not found. Check server configuration.";
          break;
        case 500:
          errorMessage = `Server Error: ${data.error || "Internal server error"}`;
          break;
        default:
          errorMessage = `Server Error (${status}): ${data.error || "Unknown error"}`;
      }
    } else if (err.request) {
      errorMessage = "No response from server. Check your network connection.";
    } else {
      errorMessage = `Request Error: ${err.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

// Chart component moved to SimpleChart.tsx

// Enhanced Real-time Price Display Component
const RealTimePrices = ({ 
  currentPrices, 
  trades 
}: { 
  currentPrices: Record<string, CurrentPriceData>;
  trades: TradeData[];
}) => {
  // Get latest trade for each symbol as fallback
  const latestTrades = trades.reduce((acc, trade) => {
    if (!acc[trade.s] || trade.T > acc[trade.s].T) {
      acc[trade.s] = trade;
    }
    return acc;
  }, {} as Record<string, TradeData>);

  // Fixed order for symbols - always show all
  const symbolOrder = ['BTCUSDT', 'ETHUSDT'];

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    return price.toFixed(4);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  return (
    <div style={{ 
      background: '#1e1e1e', 
      color: '#fff', 
      padding: '15px', 
      borderRadius: '8px',
      height: 'fit-content'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#00d4aa' }}>Live Market Prices</h3>
      
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '2px solid #333',
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        <div style={{ color: '#00d4aa' }}>Symbol</div>
        <div style={{ color: '#26a69a' }}>Price</div>
        <div style={{ color: '#ef5350' }}>Change</div>
        <div style={{ color: '#ff9800' }}>%</div>
      </div>

      {/* Table Rows - Always show all symbols */}
      <div style={{ fontSize: '12px' }}>
        {symbolOrder.map((symbol) => {
          const priceData = currentPrices[symbol];
          const fallbackTrade = latestTrades[symbol];
          
          let displayPrice = '--';
          let change = 0;
          let changePercent = 0;
          let isPositive = false;
          let isNegative = false;
          let isUpdated = false;
          
          if (priceData) {
            displayPrice = `$${formatPrice(priceData.price)}`;
            change = priceData.change;
            changePercent = priceData.changePercent;
            isPositive = change > 0;
            isNegative = change < 0;
            // Check if price was updated in the last 5 seconds
            isUpdated = Date.now() - priceData.lastUpdate < 5000;
          } else if (fallbackTrade) {
            displayPrice = `$${formatPrice(Number(fallbackTrade.p))}`;
          }
          
          return (
            <div 
              key={symbol}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '10px',
                padding: '12px 0',
                borderBottom: '1px solid #333',
                fontSize: '13px',
                minHeight: '40px',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                background: isUpdated ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                borderRadius: '4px',
                paddingLeft: '8px',
                paddingRight: '8px'
              }}
            >
              <div style={{ 
                color: symbol === 'BTCUSDT' ? '#f7931a' : '#627eea',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {symbol}
                {isUpdated && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#4caf50',
                    animation: 'pulse 1s infinite'
                  }}></div>
                )}
              </div>
              
              <div style={{ 
                color: displayPrice === '--' ? '#666' : '#fff',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {displayPrice}
              </div>
              
              <div style={{ 
                color: isPositive ? '#4caf50' : isNegative ? '#f44336' : '#666',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {change !== 0 ? formatChange(change) : '--'}
              </div>
              
              <div style={{ 
                color: isPositive ? '#4caf50' : isNegative ? '#f44336' : '#666',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {changePercent !== 0 ? formatChangePercent(changePercent) : '--'}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Status indicator */}
      <div style={{
        marginTop: '15px',
        padding: '8px',
        background: '#2a2a2a',
        borderRadius: '4px',
        fontSize: '11px',
        textAlign: 'center',
        color: '#888'
      }}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

// Time interval selector component
const TimeIntervalSelector = ({ 
  currentInterval, 
  onIntervalChange 
}: { 
  currentInterval: TimeInterval; 
  onIntervalChange: (interval: TimeInterval) => void;
}) => {
  const intervals: TimeInterval[] = ['1m', '5m', '10m', '30m', '1h', '1d'];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '5px', 
      marginBottom: '20px',
      background: '#2a2e39',
      padding: '5px',
      borderRadius: '6px',
      width: 'fit-content'
    }}>
      {intervals.map((interval) => (
        <button
          key={interval}
          onClick={() => onIntervalChange(interval)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: 'none',
            background: currentInterval === interval ? '#00d4aa' : 'transparent',
            color: currentInterval === interval ? '#1a1a1a' : '#d1d4dc',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: currentInterval === interval ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          {interval}
        </button>
      ))}
    </div>
  );
};

// Add CSS animations
const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

export default function App() {
  const [candles, setCandles] = useState<CandlestickDataPoint[]>([]);
  const [symbol, setSymbol] = useState("ETHUSDT");
  const [interval, setInterval] = useState<TimeInterval>("5m");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, CurrentPriceData>>({});
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Helper function to format price
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    return price.toFixed(4);
  };

  // WebSocket connection for real-time trades
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const tradeData: TradeData = JSON.parse(event.data);
          setTrades(prev => [...prev, tradeData].slice(-100)); // Keep last 100 trades
          
          // Update current prices with real-time data
          setCurrentPrices(prev => {
            const currentPrice = Number(tradeData.p);
            const previousData = prev[tradeData.s];
            const previousPrice = previousData?.price || currentPrice;
            
            const change = currentPrice - previousPrice;
            const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
            
            return {
              ...prev,
              [tradeData.s]: {
                symbol: tradeData.s,
                price: currentPrice,
                previousPrice: previousPrice,
                change: change,
                changePercent: changePercent,
                lastUpdate: tradeData.T,
                volume24h: previousData?.volume24h
              }
            };
          });
        } catch (err) {
          console.error('Error parsing trade data:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Fetch candlestick data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchCandlestickData(symbol, interval, 100);
      setCandles(data);
    } catch (err: any) {
      setError(err.message);
      setCandles([]);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <style>{pulseAnimation}</style>
      <div style={{ padding: 20, background: '#0d1117', minHeight: '100vh' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '300px 1fr', 
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Market Data Table - Left Side */}
        <div>
          <RealTimePrices currentPrices={currentPrices} trades={trades} />
        </div>

        {/* Main Chart Section - Right Side */}
        <div>
          <div style={{ 
            background: '#1a1a1a', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#d1d4dc' }}>{symbol} Chart</h2>
                {/* Real-time Price Ticker */}
                {currentPrices[symbol] && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '8px',
                    padding: '10px',
                    background: 'rgba(255, 152, 0, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 152, 0, 0.3)'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#ff9800',
                      animation: 'pulse 2s infinite'
                    }}>
                      ${formatPrice(currentPrices[symbol].price)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: currentPrices[symbol].change >= 0 ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      background: currentPrices[symbol].change >= 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                      borderRadius: '4px'
                    }}>
                      {currentPrices[symbol].change >= 0 ? '↗' : '↘'} 
                      {currentPrices[symbol].change >= 0 ? '+' : ''}{currentPrices[symbol].change.toFixed(2)} 
                      ({currentPrices[symbol].changePercent >= 0 ? '+' : ''}{currentPrices[symbol].changePercent.toFixed(2)}%)
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={symbol} 
                  onChange={(e) => setSymbol(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: '1px solid #2a2e39',
                    background: '#1a1a1a',
                    color: '#d1d4dc',
                    fontSize: '14px'
                  }}
                >
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="BNBUSDT">BNB/USDT</option>
                </select>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  background: wsConnected ? '#1b5e20' : '#c62828',
                  color: '#fff',
                  fontSize: '12px'
                }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    background: wsConnected ? '#4caf50' : '#f44336',
                    animation: wsConnected ? 'pulse 2s infinite' : 'none'
                  }}></div>
                  {wsConnected ? 'Live' : 'Offline'}
                </div>
              </div>
            </div>

            <TimeIntervalSelector 
              currentInterval={interval} 
              onIntervalChange={setInterval} 
            />

            <SimpleChart 
              symbol={symbol}
              data={candles}
              currentPrice={currentPrices[symbol]?.price || null}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
