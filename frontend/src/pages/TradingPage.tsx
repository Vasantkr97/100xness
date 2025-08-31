import React, { useState } from 'react';
import type { TimeInterval } from '../types/index';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCandlestickData } from '../hooks/useCandlestickData';
import { RealTimePrices } from '../components/RealTimePrices';
import { ChartContainer } from '../components/ChartContainer';

export const TradingPage: React.FC = () => {
  const [symbol, setSymbol] = useState("ETHUSDT");
  const [interval, setInterval] = useState<TimeInterval>("5m");
  
  const { trades, currentPrices, wsConnected } = useWebSocket();
  const { candles, error, isLoading } = useCandlestickData(symbol, interval);

  return (
    <div style={{ padding: 20, background: '#f8f9fa', minHeight: '100vh' }}>
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
          <ChartContainer
            symbol={symbol}
            onSymbolChange={setSymbol}
            interval={interval}
            onIntervalChange={setInterval}
            candles={candles}
            currentPrice={currentPrices[symbol]?.price || null}
            wsConnected={wsConnected}
          />
        </div>
      </div>
    </div>
  );
};
