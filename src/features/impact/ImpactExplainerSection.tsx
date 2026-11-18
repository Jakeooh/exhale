import React from 'react';
import {
  TrendingDown,
  ShieldCheck,
  Leaf,
  Scale,
} from 'lucide-react';
import { useAppStore } from '@/shared/lib/store';
import { Card } from '@/shared/ui/Card';
import { NumberCounter } from '@/shared/ui/NumberCounter';
import { formatEstimate, ASSUMPTION_CITATIONS } from '@/shared/lib/impact';

export const ImpactExplainerSection: React.FC = () => {
  const { impactSummary, swaps, airQuality } = useAppStore();

  const adoptedSwaps = swaps.filter((s) => s.adopted);

  return (
    <Card className="space-y-6" id="panel-impact" role="tabpanel" aria-labelledby="nav-tab-impact">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight">
            Impact Explainer
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Documented environmental exposure calculations and emissions reductions
          </p>
        </div>
        <span className="text-[11px] text-muted italic">
          All figures are estimates based on EPA & LBNL models
        </span>
      </div>

      {/* 3 Core Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Exposure Cut */}
        <div className="p-5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 space-y-1">
          <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Exposure Cut</span>
          </span>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
            <NumberCounter
              value={impactSummary.overallExposureReductionPct}
              prefix="~"
              suffix="%"
              durationMs={700}
            />
          </div>
          <p className="text-[11px] text-muted">
            Drop in personal PM2.5 inhalation from adopted routines
          </p>
        </div>

        {/* PM2.5 Inhalation Avoided */}
        <div className="p-5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 space-y-1">
          <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Weekly PM2.5 Kept Out</span>
          </span>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
            <NumberCounter
              value={impactSummary.weeklyPm25ExposureReducedGrams}
              decimals={2}
              suffix=" g"
              durationMs={700}
            />
          </div>
          <p className="text-[11px] text-muted">
            {formatEstimate(impactSummary.weeklyPm25ExposureReducedGrams, 'grams/week')} particulate mass avoided
          </p>
        </div>

        {/* CO2e Saved */}
        <div className="p-5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 space-y-1">
          <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Weekly CO2e Saved</span>
          </span>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
            <NumberCounter
              value={impactSummary.weeklyCo2eSavedKg}
              decimals={1}
              suffix=" kg"
              durationMs={700}
            />
          </div>
          <p className="text-[11px] text-muted">
            {formatEstimate(impactSummary.weeklyCo2eSavedKg, 'kg CO2e/week')} emissions avoided
          </p>
        </div>
      </div>

      {/* Before / After Bar */}
      <div className="p-5 rounded-xl bg-surface border border-gray-200/70 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm sm:text-base text-ink flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Inhaled PM2.5: Baseline vs. Adopted Routine</span>
          </h3>
          <span className="text-xs text-muted">µg / day</span>
        </div>

        <div className="space-y-3">
          {/* Baseline */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Unshielded Baseline</span>
              <span className="font-semibold text-ink">
                ~{Math.round((airQuality?.pm25 ?? 100) * 16 * 0.65)} µg/day
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-gray-400 dark:bg-gray-600 rounded-full w-full" />
            </div>
          </div>

          {/* With Swaps */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-primary">
                With Your Adopted Routines ({adoptedSwaps.length} active)
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ~{Math.round(
                  (airQuality?.pm25 ?? 100) *
                    16 *
                    0.65 *
                    (1 - impactSummary.overallExposureReductionPct / 100)
                )}{' '}
                µg/day
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(15, 100 - impactSummary.overallExposureReductionPct)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted leading-relaxed">
          *Calculated using an adult resting respiratory rate of 16 m³/day (EPA Exposure Factors Handbook) under 85% indoor / 15% transit partitions.
        </p>
      </div>

      {/* Adopted choices breakdown */}
      {adoptedSwaps.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-sm text-ink">
            Active Routines
          </h3>
          <div className="space-y-2">
            {adoptedSwaps.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-surface flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
              >
                <div>
                  <span className="font-semibold text-ink">{s.title}</span>
                  <p className="text-muted text-[11px] mt-0.5">{s.impact.explanation}</p>
                </div>
                <span className="font-semibold text-primary shrink-0 text-left sm:text-right">
                  Est. -{s.impact.pm25AvoidedGramsWeekly}g PM2.5 / -{s.impact.co2eAvoidedKgWeekly}kg CO2e
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions Footer */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-muted space-y-1">
        <span className="font-semibold text-ink block">Documented Constants & Citations:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {Object.entries(ASSUMPTION_CITATIONS).slice(0, 4).map(([key, cite]) => (
            <div key={key} className="text-muted">
              • <strong className="text-ink">{key.replace('_', ' ')}:</strong> {cite}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
