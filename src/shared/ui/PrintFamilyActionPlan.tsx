import React from 'react';
import { useAppStore } from '@/shared/lib/store';

export const PrintFamilyActionPlan: React.FC = () => {
  const { profile, airQuality, dayPlan, indoorHacks, swaps, communityActions } = useAppStore();

  if (!profile || !airQuality) return null;

  const adoptedSwaps = swaps.filter((s) => s.adopted);

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans space-y-6" aria-hidden="true">
      {/* Header */}
      <div className="border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight">
          Exhale — Family Clean Air Action Plan
        </h1>
        <p className="text-sm text-gray-700">
          Location: <strong>{profile.location.name}</strong> • Date: {new Date().toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-600">
          Household: {profile.household.membersCount} members ({profile.household.homeType}) • Sensitive members:{' '}
          {profile.household.hasSensitiveMembers ? 'Yes' : 'No'}
        </p>
      </div>

      {/* Air Quality Summary */}
      <div className="p-4 border border-black rounded-lg space-y-1">
        <h2 className="text-base font-bold uppercase">Today's Air Quality Status</h2>
        <p className="text-lg font-extrabold">
          AQI: {airQuality.aqi} — {airQuality.categoryLabel}
        </p>
        <p className="text-sm">
          {airQuality.whoComparison} (PM2.5: {airQuality.pm25} µg/m³)
        </p>
        <p className="text-xs text-gray-800">
          Best Outdoor Window: <strong>{airQuality.bestOutdoorWindow.start} - {airQuality.bestOutdoorWindow.end}</strong> ({airQuality.bestOutdoorWindow.advice})
        </p>
      </div>

      {/* Routine Time Blocks */}
      <div className="space-y-2">
        <h2 className="text-base font-bold uppercase border-b border-gray-400 pb-1">
          Daily Low-Emission Routine
        </h2>
        <div className="space-y-3">
          {dayPlan.map((block) => (
            <div key={block.id} className="text-xs">
              <span className="font-bold uppercase tracking-wide">
                [{block.period}] {block.timeLabel}:
              </span>{' '}
              <span>{block.selectedAlternative || block.recommendedAction}</span>
              <p className="text-[11px] text-gray-600 pl-4">Context: {block.aqiAdvice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Indoor Air Hacks */}
      <div className="space-y-2 page-break">
        <h2 className="text-base font-bold uppercase border-b border-gray-400 pb-1">
          Household Indoor Defense Protocols
        </h2>
        <div className="space-y-2">
          {indoorHacks.slice(0, 4).map((hack, idx) => (
            <div key={hack.id} className="text-xs">
              <span className="font-bold">
                {idx + 1}. {hack.title}
              </span>{' '}
              ({hack.expectedEffect})
              <p className="text-[11px] text-gray-700 pl-4">{hack.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adopted Swaps */}
      {adoptedSwaps.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-bold uppercase border-b border-gray-400 pb-1">
            Adopted Family Swaps
          </h2>
          <div className="space-y-1 text-xs">
            {adoptedSwaps.map((s) => (
              <div key={s.id}>
                • <strong>{s.title}</strong>: {s.proposedSwap} (Reduces exposure by ~{s.impact.exposureReductionPct}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Action Pack */}
      <div className="space-y-2">
        <h2 className="text-base font-bold uppercase border-b border-gray-400 pb-1">
          Neighborhood Action Pack Pledges
        </h2>
        <div className="space-y-1 text-xs">
          {communityActions.map((a, i) => (
            <div key={a.id}>
              {i + 1}. {a.title} {a.userPledged ? '[PLEDGED]' : ''} — {a.subtitle}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-black pt-2 text-[10px] text-gray-600">
        *General environmental guidance, not medical advice. Produced by Exhale. Consult medical professionals for acute symptoms.
      </div>
    </div>
  );
};
