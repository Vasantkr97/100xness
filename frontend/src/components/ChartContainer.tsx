import React from 'react';
import type { CandlestickDataPoint, TimeInterval } from '../types/index';
import { ChartHeader } from './ChartHeader';
import { TimeIntervalSelector } from './TimeIntervalSelector';
import SimpleChart from '../SimpleChart';

interface ChartContainerProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  interval: TimeInterval;
  onIntervalChange: (interval: TimeInterval) => void;
  candles: CandlestickDataPoint[];
  currentPrice: number | null;
  wsConnected: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  symbol,
  onSymbolChange,
  interval,
  onIntervalChange,
  candles,
  currentPrice,
  wsConnected
}) => {
  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <ChartHeader
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        currentPrice={currentPrice ? {
          symbol,
          price: currentPrice,
          previousPrice: currentPrice,
          change: 0,
          changePercent: 0,
          lastUpdate: Date.now()
        } : undefined}
        wsConnected={wsConnected}
      />

      <TimeIntervalSelector 
        currentInterval={interval} 
        onIntervalChange={onIntervalChange} 
      />

      <SimpleChart 
        symbol={symbol}
        data={candles}
        currentPrice={currentPrice}
      />
    </div>
  );
};
