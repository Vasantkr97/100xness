# Frontend Trading Application

This is a React-based trading application with real-time market data and candlestick charts.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChartContainer.tsx
│   ├── ChartHeader.tsx
│   ├── RealTimePrices.tsx
│   ├── TimeIntervalSelector.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useCandlestickData.ts
│   ├── useWebSocket.ts
│   └── index.ts
├── pages/              # Page components
│   └── TradingPage.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── formatters.ts
├── styles/             # CSS styles
│   └── animations.css
├── App.tsx             # Main application component
└── SimpleChart.tsx     # Chart component
```

## Components

### `RealTimePrices`
Displays live market prices in a table format with real-time updates.

### `ChartContainer`
Container component that combines chart header, time interval selector, and the chart itself.

### `ChartHeader`
Header component with symbol selector and connection status indicator.

### `TimeIntervalSelector`
Component for selecting different time intervals (1m, 5m, 10m, 30m, 1h, 1d).

## Hooks

### `useWebSocket`
Manages WebSocket connection for real-time trade data and price updates.

### `useCandlestickData`
Handles fetching and managing candlestick data for charts.

## Types

- `TradeData`: Interface for trade data from WebSocket
- `CurrentPriceData`: Interface for current price information
- `CandlestickDataPoint`: Interface for candlestick chart data
- `TimeInterval`: Type for time interval options

## Features

- Real-time market data via WebSocket
- Interactive candlestick charts
- Multiple time intervals
- Symbol switching (ETH/USDT, BTC/USDT, BNB/USDT)
- Live price updates with visual indicators
- Connection status monitoring
- Responsive design

## Usage

The application is structured with a clean separation of concerns:

1. **App.tsx**: Entry point that renders the main trading page
2. **TradingPage.tsx**: Main page component that orchestrates all features
3. **Components**: Reusable UI components for different parts of the interface
4. **Hooks**: Custom hooks for data management and WebSocket handling
5. **Types**: TypeScript definitions for type safety
6. **Utils**: Helper functions for formatting and data manipulation
