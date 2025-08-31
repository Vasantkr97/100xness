import { useState, useRef, useEffect } from 'react';
import type { TradeData, CurrentPriceData } from '../types/index';

export const useWebSocket = () => {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, CurrentPriceData>>({});
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

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

  return {
    trades,
    currentPrices,
    wsConnected
  };
};
