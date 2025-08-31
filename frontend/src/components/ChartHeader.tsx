import React from 'react';
import type { CurrentPriceData } from '../types/index';
import { formatPrice } from '../utils/formatters';

interface ChartHeaderProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  currentPrice: CurrentPriceData | undefined;
  wsConnected: boolean;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  symbol,
  onSymbolChange,
  currentPrice,
  wsConnected
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <div>
        <h2 style={{ margin: 0 }}>{symbol} Chart</h2>
        {/* Real-time Price Ticker */}
        {currentPrice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '8px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              ${formatPrice(currentPrice.price)}
            </div>
            <div style={{
              fontSize: '12px',
              color: currentPrice.change >= 0 ? 'green' : 'red',
              fontWeight: 'bold',
              padding: '4px 8px',
              background: currentPrice.change >= 0 ? '#d4edda' : '#f8d7da',
              borderRadius: '4px'
            }}>
              {currentPrice.change >= 0 ? '↗' : '↘'} 
              {currentPrice.change >= 0 ? '+' : ''}{currentPrice.change.toFixed(2)} 
              ({currentPrice.changePercent >= 0 ? '+' : ''}{currentPrice.changePercent.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select 
          value={symbol} 
          onChange={(e) => onSymbolChange(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            background: 'white'
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
          background: wsConnected ? '#d4edda' : '#f8d7da',
          color: wsConnected ? '#155724' : '#721c24',
          fontSize: '12px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%',
            background: wsConnected ? 'green' : 'red'
          }}></div>
          {wsConnected ? 'Live' : 'Offline'}
        </div>
      </div>
    </div>
  );
};
