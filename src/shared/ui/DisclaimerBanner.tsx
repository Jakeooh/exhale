import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X, HeartPulse } from 'lucide-react';
import { AQICategory } from '@/types';

interface DisclaimerBannerProps {
  category?: AQICategory;
  aqi?: number;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  category = 'moderate',
  aqi = 85,
}) => {
  const [isEmergencyBannerDismissed, setIsEmergencyBannerDismissed] = useState(false);
  const isHazardous = category === 'hazardous' || aqi >= 300;
  const isVeryUnhealthy = category === 'very_unhealthy';

  return (
    <div className="w-full space-y-3" role="region" aria-label="Health and safety notices">
      {/* Calm, prominent emergency guidance banner for Hazardous / Very Unhealthy air */}
      {(isHazardous || isVeryUnhealthy) && !isEmergencyBannerDismissed && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fade-in ${
            isHazardous
              ? 'bg-red-500/10 border-red-500/30 text-ink dark:bg-red-950/40 dark:border-red-800'
              : 'bg-purple-500/10 border-purple-500/30 text-ink dark:bg-purple-950/40 dark:border-purple-800'
          }`}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  isHazardous ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'
                }`}
                aria-hidden="true"
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base sm:text-lg flex items-center gap-2">
                  <span>{isHazardous ? 'Severe Smog Emergency Alert' : 'Very Unhealthy Air Quality'}</span>
                  <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/40 font-semibold">
                    AQI {aqi}
                  </span>
                </h3>
                <p className="text-sm text-ink/90 dark:text-gray-200">
                  Outdoor air poses immediate respiratory risk. <strong>Stay indoors</strong> and follow emergency protocols:
                </p>
                <ul className="text-xs sm:text-sm space-y-1 pt-1 text-ink/80 dark:text-gray-300 list-disc list-inside">
                  <li>Keep all exterior doors and windows strictly shut; tape drafty seams.</li>
                  <li>Run HEPA purifiers or DIY box fans on continuous medium/high.</li>
                  <li>Avoid indoor frying, incense, or vacuuming without HEPA exhaust.</li>
                  <li>If stepping outside is strictly unavoidable, wear a sealed N95/KN95 respirator.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setIsEmergencyBannerDismissed(true)}
              className="text-muted hover:text-ink p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Dismiss emergency banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent unobtrusive baseline medical disclaimer */}
      <div className="flex items-center justify-between text-xs text-muted border-t border-gray-200/60 dark:border-gray-800 pt-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>
            <strong>General advisory only:</strong> Exhale provides low-emission lifestyle suggestions and exposure estimates. It is not medical advice. Consult a healthcare professional or municipal health portal for urgent health symptoms.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 ml-4 font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>WHO Guidelines Aligned</span>
        </div>
      </div>
    </div>
  );
};
