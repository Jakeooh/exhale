import { useEffect, Suspense, lazy } from 'react';
import { useAppStore } from '@/shared/lib/store';
import { Navbar } from '@/shared/ui/Navbar';
import { TabBar } from '@/shared/ui/TabBar';
import { HazeHero } from '@/shared/ui/HazeHero';
import { DisclaimerBanner } from '@/shared/ui/DisclaimerBanner';
import { PrintFamilyActionPlan } from '@/shared/ui/PrintFamilyActionPlan';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { TodaysAirCard } from '@/features/airnow/TodaysAirCard';
import { getSampleAirData } from '@/services/airquality';

// Lazy-loaded feature sections for optimal efficiency
const DayPlanSection = lazy(() =>
  import('@/features/dayplan/DayPlanSection').then((m) => ({ default: m.DayPlanSection }))
);
const IndoorHacksSection = lazy(() =>
  import('@/features/indoor/IndoorHacksSection').then((m) => ({ default: m.IndoorHacksSection }))
);
const SustainableSwapsSection = lazy(() =>
  import('@/features/swaps/SustainableSwapsSection').then((m) => ({
    default: m.SustainableSwapsSection,
  }))
);
const ImpactExplainerSection = lazy(() =>
  import('@/features/impact/ImpactExplainerSection').then((m) => ({
    default: m.ImpactExplainerSection,
  }))
);
const CommunityModeSection = lazy(() =>
  import('@/features/community/CommunityModeSection').then((m) => ({
    default: m.CommunityModeSection,
  }))
);
const AskExhaleChat = lazy(() =>
  import('@/features/assistant/AskExhaleChat').then((m) => ({ default: m.AskExhaleChat }))
);

export function App() {
  const {
    profile,
    hasCompletedOnboarding,
    airQuality,
    setProfile,
    loadAirQuality,
    activeTab,
  } = useAppStore();

  useEffect(() => {
    if (hasCompletedOnboarding && profile && !airQuality) {
      loadAirQuality();
    }
  }, [hasCompletedOnboarding, profile, airQuality, loadAirQuality]);

  const activeAir = airQuality || getSampleAirData();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink transition-colors duration-200">
      {/* WCAG 2.4.1 Bypass Blocks / Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-medium text-sm transition-all"
      >
        Skip to main content
      </a>

      <Navbar />

      <ErrorBoundary>
        {!hasCompletedOnboarding ? (
          <main id="main-content" tabIndex={-1} className="flex-1 pb-16 outline-none">
            <OnboardingWizard onComplete={setProfile} />
          </main>
        ) : (
          <>
            <TabBar />

            <HazeHero category={activeAir.category} aqi={activeAir.aqi}>
              <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 outline-none">
                <h1 className="sr-only">
                  Exhale Air Quality Dashboard for {profile?.location.name}
                </h1>

                {/* Emergency Banner (appears only on severe hazardous smog) */}
                <DisclaimerBanner category={activeAir.category} aqi={activeAir.aqi} />

                {/* Focused Active View */}
                <div className="w-full animate-fade-in">
                  {activeTab === 'airnow' && (
                    <TodaysAirCard
                      data={activeAir}
                      locationName={profile?.location.name ?? 'My City'}
                    />
                  )}

                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        <Skeleton height="h-28" />
                        <Skeleton height="h-28" />
                      </div>
                    }
                  >
                    {activeTab === 'dayplan' && <DayPlanSection />}
                    {activeTab === 'indoor' && <IndoorHacksSection />}
                    {activeTab === 'swaps' && <SustainableSwapsSection />}
                    {activeTab === 'impact' && <ImpactExplainerSection />}
                    {activeTab === 'community' && <CommunityModeSection />}
                    {activeTab === 'assistant' && <AskExhaleChat />}
                  </Suspense>
                </div>
              </main>
            </HazeHero>

            {/* Clean, quiet footer */}
            <footer className="border-t border-gray-200/60 dark:border-gray-800 bg-surface py-6 text-xs text-muted no-print mt-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <p className="font-medium text-ink">
                    Exhale · Smog & Air Quality Assistant
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Air data from{' '}
                    <a
                      href="https://open-meteo.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary hover:text-ink font-medium"
                    >
                      Open-Meteo
                    </a>{' '}
                    (CC BY 4.0). Impact estimates based on US EPA & LBNL formulas.
                  </p>
                </div>
                <div className="text-[11px] text-muted">
                  Zero tracking · All data stored locally on your device
                </div>
              </div>
            </footer>
          </>
        )}
      </ErrorBoundary>

      {/* Print View Component */}
      <PrintFamilyActionPlan />
    </div>
  );
}

export default App;
