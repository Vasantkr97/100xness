import React from 'react';
import type { TradeData, CurrentPriceData } from '../types/index';
import { formatPrice, formatChange, formatChangePercent } from '../utils/formatters';

interface RealTimePricesProps {
  currentPrices: Record<string, CurrentPriceData>;
  trades: TradeData[];
}

export const RealTimePrices: React.FC<RealTimePricesProps> = ({ 
  currentPrices, 
  trades 
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

  return (
    <div style={{ 
      background: '#f5f5f5', 
      padding: '15px', 
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>Live Market Prices</h3>
      
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid #ccc',
        fontWeight: 'bold'
      }}>
        <div>Symbol</div>
        <div>Price</div>
        <div>Change</div>
        <div>%</div>
      </div>

      {/* Table Rows */}
      <div>
        {symbolOrder.map((symbol) => {
          const priceData = currentPrices[symbol];
          const fallbackTrade = latestTrades[symbol];
          
          let displayPrice = '--';
          let change = 0;
          let changePercent = 0;
          let isPositive = false;
          let isNegative = false;
          
          if (priceData) {
            displayPrice = `$${formatPrice(priceData.price)}`;
            change = priceData.change;
            changePercent = priceData.changePercent;
            isPositive = change > 0;
            isNegative = change < 0;
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
                padding: '10px 0',
                borderBottom: '1px solid #eee'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>
                {symbol}
              </div>
              
              <div>
                {displayPrice}
              </div>
              
              <div style={{ 
                color: isPositive ? 'green' : isNegative ? 'red' : 'black'
              }}>
                {change !== 0 ? formatChange(change) : '--'}
              </div>
              
              <div style={{ 
                color: isPositive ? 'green' : isNegative ? 'red' : 'black'
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
        background: '#e9e9e9',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
