import React from 'react';
import { HourlyForecastItem, BestOutdoorWindow } from '@/types';
import { getAQIMeta } from '@/shared/lib/aqi';

interface ForecastSparklineProps {
  hourly: HourlyForecastItem[];
  bestWindow: BestOutdoorWindow;
}

export const ForecastSparkline: React.FC<ForecastSparklineProps> = ({
  hourly,
  bestWindow,
}) => {
  if (!hourly || hourly.length === 0) return null;

  // Take first 12 to 24 points
  const points = hourly.slice(0, 16);
  const maxAqi = Math.max(100, ...points.map((p) => p.aqi));
  const minAqi = Math.min(...points.map((p) => p.aqi));

  const width = 480;
  const height = 90;
  const paddingX = 16;
  const paddingY = 14;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const coordinates = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * innerWidth;
    // Invert Y axis
    const range = maxAqi - minAqi || 1;
    const y = paddingY + innerHeight - ((p.aqi - minAqi) / range) * innerHeight;
    return { x, y, ...p };
  });

  // Construct SVG path string
  const pathD = coordinates.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Area under path
  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x} ${height} L ${coordinates[0].x} ${height} Z`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink flex items-center gap-1.5">
          <span>24-Hour Smog Trend</span>
        </span>
        <span className="text-muted">
          Peak {maxAqi} AQI • Min {minAqi} AQI
        </span>
      </div>

      {/* Accessible Sparkline Chart */}
      <div className="relative w-full overflow-hidden rounded-xl bg-canvas border border-gray-100 dark:border-gray-800 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 overflow-visible"
          role="img"
          aria-label={`24-hour AQI forecast chart ranging from ${minAqi} to ${maxAqi}. Lowest window is between ${bestWindow.start} and ${bestWindow.end}.`}
        >
          <defs>
            <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#aqiAreaGrad)" />

          {/* Forecast Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#14B8A6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coordinates.map((pt, i) => {
            const meta = getAQIMeta(pt.aqi);
            const isBest = pt.isBestWindow;
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isBest ? 4.5 : 2.5}
                  fill={isBest ? '#14B8A6' : meta.hex}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Hour Axis Labels */}
        <div className="flex items-center justify-between text-[10px] text-muted font-medium px-2 pt-1 border-t border-gray-100 dark:border-gray-800/80">
          <span>{coordinates[0]?.hourLabel}</span>
          <span>{coordinates[Math.floor(coordinates.length / 2)]?.hourLabel}</span>
          <span>{coordinates[coordinates.length - 1]?.hourLabel}</span>
        </div>
      </div>

      {/* Screen reader hidden data table for accessibility */}
      <table className="sr-only">
        <caption>Hourly Air Quality Forecast</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">AQI</th>
            <th scope="col">PM2.5 (µg/m³)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, idx) => (
            <tr key={idx}>
              <td>{p.hourLabel}</td>
              <td>{p.aqi}</td>
              <td>{p.pm25}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
