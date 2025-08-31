import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { CandlestickDataPoint, TimeInterval } from '../types/index';

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
          time: Math.floor(new Date(item.time).getTime() / 1000) as CandlestickDataPoint['time'],
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

export const useCandlestickData = (symbol: string, interval: TimeInterval) => {
  const [candles, setCandles] = useState<CandlestickDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return {
    candles,
    error,
    isLoading,
    refetch: fetchData
  };
};
