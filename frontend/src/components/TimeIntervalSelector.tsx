import React from 'react';
import type { TimeInterval } from '../types/index';

interface TimeIntervalSelectorProps {
  currentInterval: TimeInterval;
  onIntervalChange: (interval: TimeInterval) => void;
}

export const TimeIntervalSelector: React.FC<TimeIntervalSelectorProps> = ({ 
  currentInterval, 
  onIntervalChange 
}) => {
  const intervals: TimeInterval[] = ['1m', '5m', '10m', '30m', '1h', '1d'];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '5px', 
      marginBottom: '20px'
    }}>
      {intervals.map((interval) => (
        <button
          key={interval}
          onClick={() => onIntervalChange(interval)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: currentInterval === interval ? '#007bff' : 'white',
            color: currentInterval === interval ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          {interval}
        </button>
      ))}
    </div>
  );
};
