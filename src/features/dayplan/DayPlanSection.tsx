import React, { useState } from 'react';
import {
  Sun,
  Briefcase,
  Compass,
  Sunset,
  Moon,
  RefreshCw,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { DayPeriod } from '@/types';
import { useAppStore } from '@/shared/lib/store';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';

export const DayPlanSection: React.FC = () => {
  const {
    dayPlan,
    planLoading,
    generatePlan,
    selectPlanAlternative,
  } = useAppStore();

  const [activeAltModalBlockId, setActiveAltModalBlockId] = useState<string | null>(null);

  const getPeriodIcon = (period: DayPeriod) => {
    switch (period) {
      case 'morning':
        return <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      case 'commute':
        return <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />;
      case 'midday':
        return <Compass className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      case 'evening':
        return <Sunset className="w-4 h-4 text-orange-500" aria-hidden="true" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-400" aria-hidden="true" />;
    }
  };

  const getPeriodBadge = (period: DayPeriod) => {
    switch (period) {
      case 'morning':
        return 'Morning';
      case 'commute':
        return 'Commute';
      case 'midday':
        return 'Midday';
      case 'evening':
        return 'Evening';
      case 'night':
        return 'Overnight';
    }
  };

  return (
    <Card className="space-y-6" id="panel-dayplan" role="tabpanel" aria-labelledby="nav-tab-dayplan">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight">
            My Day Plan
          </h2>
          <p className="text-xs text-muted mt-0.5">
            A low-emission daily routine tailored to your household and today's smog levels
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => generatePlan(true)}
          isLoading={planLoading}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className="w-3 h-3 text-muted" aria-hidden="true" />
          <span>Regenerate</span>
        </Button>
      </div>

      {/* Loading Skeleton */}
      {planLoading && (
        <div className="space-y-3">
          <Skeleton height="h-20" />
          <Skeleton height="h-20" />
          <Skeleton height="h-20" />
        </div>
      )}

      {/* Timeline Blocks */}
      {!planLoading && (
        <div className="space-y-3">
          {dayPlan.map((block) => {
            const hasSelectedAlt = !!block.selectedAlternative;
            return (
              <div
                key={block.id}
                className="p-4 sm:p-5 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-surface space-y-3"
              >
                {/* Block header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-ink">
                      {getPeriodIcon(block.period)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-ink">
                      {getPeriodBadge(block.period)}
                    </span>
                    <span className="text-xs text-muted">· {block.timeLabel}</span>
                  </div>

                  {block.alternatives && block.alternatives.length > 0 && (
                    <button
                      onClick={() => setActiveAltModalBlockId(block.id)}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      aria-label={`Pick an alternative for ${block.period}`}
                    >
                      <ArrowRightLeft className="w-3 h-3" aria-hidden="true" />
                      <span>{hasSelectedAlt ? 'Change' : 'Alternative'}</span>
                    </button>
                  )}
                </div>

                {/* Main Activity */}
                <h3 className="font-heading font-semibold text-sm sm:text-base text-ink">
                  {block.activity}
                </h3>

                {/* Recommended Protocol */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-xs sm:text-sm text-ink leading-relaxed">
                  <span className="text-muted block text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                    {hasSelectedAlt ? 'Selected Alternative' : 'Recommended Protocol'}
                  </span>
                  {block.selectedAlternative || block.recommendedAction}
                </div>

                {/* Subtle Smog context note */}
                <p className="text-[11px] text-muted">
                  <strong>Why:</strong> {block.aqiAdvice}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Selection Modal */}
      {activeAltModalBlockId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alt-modal-title"
        >
          <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 id="alt-modal-title" className="font-heading font-bold text-base text-ink">
                Choose Alternative Routine
              </h2>
              <button
                onClick={() => setActiveAltModalBlockId(null)}
                className="text-muted hover:text-ink text-sm p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Select an alternative action that fits your schedule better:
            </p>

            <div className="space-y-2">
              {dayPlan
                .find((b) => b.id === activeAltModalBlockId)
                ?.alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      selectPlanAlternative(activeAltModalBlockId, alt);
                      setActiveAltModalBlockId(null);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary text-xs sm:text-sm text-ink transition-colors flex items-start gap-2"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{alt}</span>
                  </button>
                ))}

              <button
                onClick={() => {
                  const block = dayPlan.find((b) => b.id === activeAltModalBlockId);
                  if (block) {
                    selectPlanAlternative(activeAltModalBlockId, block.recommendedAction);
                  }
                  setActiveAltModalBlockId(null);
                }}
                className="w-full text-center text-xs text-muted hover:text-ink pt-2 font-medium"
              >
                Reset to default recommendation
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
