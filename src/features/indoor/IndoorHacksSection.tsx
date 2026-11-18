import React, { useState } from 'react';
import {
  Home,
  Wind,
  Layers,
  Flame,
  Droplets,
  Wrench,
} from 'lucide-react';
import { IndoorHack } from '@/types';
import { useAppStore } from '@/shared/lib/store';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

export const IndoorHacksSection: React.FC = () => {
  const { indoorHacks, planLoading } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (cat: IndoorHack['category']) => {
    switch (cat) {
      case 'ventilation':
        return <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />;
      case 'diy_purifier':
        return <Wrench className="w-4 h-4 text-indigo-500" aria-hidden="true" />;
      case 'sealing':
        return <Layers className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      case 'cooking':
        return <Flame className="w-4 h-4 text-rose-500" aria-hidden="true" />;
      case 'plants_humidity':
        return <Droplets className="w-4 h-4 text-emerald-500" aria-hidden="true" />;
      default:
        return <Home className="w-4 h-4 text-muted" aria-hidden="true" />;
    }
  };

  const filtered =
    selectedCategory === 'all'
      ? indoorHacks
      : indoorHacks.filter((h) => h.category === selectedCategory);

  return (
    <Card className="space-y-6" id="panel-indoor" role="tabpanel" aria-labelledby="nav-tab-indoor">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight">
            Indoor Air Hacks
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Ranked, practical techniques to stop outdoor smog from entering your home
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Filter hacks">
          {['all', 'ventilation', 'diy_purifier', 'sealing', 'cooking', 'plants_humidity'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-ink text-surface dark:bg-white dark:text-gray-900'
                  : 'text-muted hover:text-ink hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat === 'all'
                ? 'All'
                : cat === 'diy_purifier'
                ? 'DIY Purifier'
                : cat === 'plants_humidity'
                ? 'Humidity & Plants'
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {planLoading && (
        <div className="space-y-3">
          <Skeleton height="h-24" />
          <Skeleton height="h-24" />
        </div>
      )}

      {/* Hacks List */}
      {!planLoading && (
        <div className="space-y-3">
          {filtered.map((hack, index) => (
            <div
              key={hack.id}
              className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-surface space-y-3"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-bold text-muted mt-0.5">#{index + 1}</span>
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-ink shrink-0">
                    {getCategoryIcon(hack.category)}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm sm:text-base text-ink">
                      {hack.title}
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {hack.description}
                    </p>
                  </div>
                </div>

                {/* Cost/Effort Badges */}
                <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-medium text-muted">
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-ink">
                    {hack.cost}
                  </span>
                  <span>·</span>
                  <span>{hack.effort} effort</span>
                </div>
              </div>

              {/* Expected Effect */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-medium text-ink">
                  <strong>Effect:</strong> {hack.expectedEffect}
                </span>
                <span className="text-muted text-[11px]">
                  Est. PM2.5 cut: ~{hack.impact.pm25ReductionPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
