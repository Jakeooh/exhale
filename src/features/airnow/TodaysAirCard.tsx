import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { AirQualityData } from '@/types';
import { Card } from '@/shared/ui/Card';
import { AqiGauge } from './AqiGauge';
import { ForecastSparkline } from './ForecastSparkline';
import { getAQIMeta } from '@/shared/lib/aqi';

interface TodaysAirCardProps {
  data: AirQualityData;
  locationName: string;
}

export const TodaysAirCard: React.FC<TodaysAirCardProps> = ({ data, locationName }) => {
  const meta = getAQIMeta(data.aqi);
  const bestWindow = data.bestOutdoorWindow;

  return (
    <Card className="space-y-6" id="panel-airnow" role="tabpanel" aria-labelledby="nav-tab-airnow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-100 dark:border-gray-800/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight">
            Today's Air in {locationName}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {meta.healthSummary}
          </p>
        </div>
        <div className="text-[11px] text-muted flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Live atmospheric update</span>
        </div>
      </div>

      {/* Main Grid: Gauge + Key Context */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Gauge */}
        <div className="md:col-span-5 flex justify-center py-2">
          <AqiGauge aqi={data.aqi} />
        </div>

        {/* Right: WHO Context & Advice */}
        <div className="md:col-span-7 space-y-4">
          {/* WHO Comparison Line */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>WHO Guideline Comparison</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-ink">
              {data.whoComparison}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              WHO 24-hr threshold is 15 µg/m³. Today's PM2.5 level is {data.pm25} µg/m³.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-ink/90 leading-relaxed">
            {meta.outdoorAdvice}
          </p>

          {/* 4 Core Pollutants */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block">PM2.5</span>
              <span className="text-sm font-bold text-ink">{data.pm25}</span>
              <span className="text-[10px] text-muted block">µg/m³</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block">PM10</span>
              <span className="text-sm font-bold text-ink">{data.pm10}</span>
              <span className="text-[10px] text-muted block">µg/m³</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block">NO2</span>
              <span className="text-sm font-bold text-ink">{data.no2}</span>
              <span className="text-[10px] text-muted block">µg/m³</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block">O3</span>
              <span className="text-sm font-bold text-ink">{data.o3}</span>
              <span className="text-[10px] text-muted block">µg/m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Window Outside */}
      <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink">
              Best Window Outside
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface border border-gray-200 dark:border-gray-700 text-ink">
              {bestWindow.start} – {bestWindow.end}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">{bestWindow.advice}</p>
        </div>
      </div>

      {/* 24-Hour Sparkline */}
      <ForecastSparkline hourly={data.hourly} bestWindow={bestWindow} />
    </Card>
  );
};
