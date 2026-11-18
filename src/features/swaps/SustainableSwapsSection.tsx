import React from 'react';
import {
  Check,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/shared/lib/store';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';

export const SustainableSwapsSection: React.FC = () => {
  const { swaps, toggleAdoptSwap, planLoading } = useAppStore();

  return (
    <Card className="space-y-6" id="panel-swaps" role="tabpanel" aria-labelledby="nav-tab-swaps">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight">
            Sustainable Swaps
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Cleaner alternatives to your daily habits with honest, realistic trade-offs
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {planLoading && (
        <div className="space-y-3">
          <Skeleton height="h-28" />
          <Skeleton height="h-28" />
        </div>
      )}

      {/* Swaps Grid */}
      {!planLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swaps.map((swap) => {
            const isAdopted = swap.adopted;

            return (
              <div
                key={swap.id}
                className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isAdopted
                    ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-500/60'
                    : 'bg-surface border-gray-200/70 dark:border-gray-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Category and status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                      {swap.category}
                    </span>
                    {isAdopted && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Adopted
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-semibold text-base text-ink">
                    {swap.title}
                  </h3>

                  {/* Clean Before / After box */}
                  <div className="space-y-2 text-xs">
                    <div className="text-muted">
                      <span className="font-semibold text-ink">Current: </span>
                      {swap.currentChoice}
                    </div>
                    <div className="text-primary font-medium">
                      <span className="font-semibold">Cleaner swap: </span>
                      {swap.proposedSwap}
                    </div>
                    <div className="text-muted text-[11px] italic">
                      Trade-off: {swap.tradeOff}
                    </div>
                  </div>

                  {/* Impact preview */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-muted">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ~{swap.impact.exposureReductionPct}% exposure cut
                    </span>
                    <span>Est. -{swap.impact.co2eAvoidedKgWeekly} kg CO2e/wk</span>
                  </div>
                </div>

                {/* Adopt Toggle */}
                <Button
                  variant={isAdopted ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleAdoptSwap(swap.id)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold"
                  aria-pressed={isAdopted}
                >
                  {isAdopted ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Adopted (Tap to Remove)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Adopt This Swap</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
