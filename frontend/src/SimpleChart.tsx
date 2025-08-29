import React, { useRef, useEffect } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from "lightweight-charts";

interface CandlestickDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SimpleChartProps {
  data: CandlestickDataPoint[];
  currentPrice: number | null;
  symbol: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, currentPrice, symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart once
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#1a1a1a" },
          textColor: "#d1d4dc",
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
        grid: {
          vertLines: { color: "rgba(42, 46, 57, 0.5)" },
          horzLines: { color: "rgba(42, 46, 57, 0.5)" },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: "#758696",
            width: 1,
            style: 3,
            labelBackgroundColor: "#1a1a1a",
          },
          horzLine: {
            color: "#758696",
            width: 1,
            style: 3,
            labelBackgroundColor: "#1a1a1a",
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#2a2e39",
          barSpacing: 6,
          minBarSpacing: 2,
        },
        rightPriceScale: {
          borderColor: "#2a2e39",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
      });

      candleSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        borderUpColor: "#26a69a",
        wickUpColor: "#26a69a",
        downColor: "#ef5350",
        borderDownColor: "#ef5350",
        wickDownColor: "#ef5350",
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
      });
    }

    // Update data
    if (data.length > 0) {
      candleSeriesRef.current?.setData(data);
      chartRef.current?.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={chartContainerRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default SimpleChart;
