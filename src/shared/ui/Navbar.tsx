import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Printer,
  Trash2,
  Users,
  ChevronDown,
  RefreshCw,
  Wind,
  MessageCircle,
  CalendarCheck,
  Home,
  ArrowLeftRight,
  TrendingDown,
} from 'lucide-react';
import { useAppStore, ActiveTabId } from '@/shared/lib/store';
import { SAMPLE_PROFILES } from '@/shared/lib/constants';
import { Button } from './Button';
import { getAQIMeta } from '@/shared/lib/aqi';

const TABS: { id: ActiveTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'airnow', label: "Today's Air", icon: Wind },
  { id: 'dayplan', label: 'My Day', icon: CalendarCheck },
  { id: 'indoor', label: 'Indoor Hacks', icon: Home },
  { id: 'swaps', label: 'Swaps', icon: ArrowLeftRight },
  { id: 'impact', label: 'Impact', icon: TrendingDown },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'assistant', label: 'Ask Exhale', icon: MessageCircle },
];

export const Navbar: React.FC = () => {
  const {
    profile,
    airQuality,
    airQualityLoading,
    isDarkMode,
    activeTab,
    setActiveTab,
    toggleTheme,
    loadSampleProfile,
    clearAllUserData,
    loadAirQuality,
    toggleSampleDataMode,
  } = useAppStore();

  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const aqiMeta = airQuality ? getAQIMeta(airQuality.aqi) : null;

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-colors no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & City */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('airnow')}
              className="flex items-center gap-2 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            >
              <span className="font-heading font-extrabold text-xl tracking-tight text-ink">
                exhale
              </span>
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            </button>

            {/* Subtle Location & AQI pill */}
            {airQuality && profile && (
              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 text-xs">
                <span className="text-muted font-medium truncate max-w-[140px]">
                  {profile.location.name.split(',')[0]}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px]"
                  style={{ backgroundColor: `${aqiMeta?.hex}18`, color: aqiMeta?.hex }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: aqiMeta?.hex }}
                    aria-hidden="true"
                  />
                  <span>AQI {airQuality.aqi}</span>
                  <span className="hidden xl:inline text-muted">· {aqiMeta?.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* Desktop Center Segmented Tab Bar */}
          {profile && (
            <nav
              role="tablist"
              aria-label="Dashboard views"
              className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50"
            >
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? 'bg-surface text-ink shadow-sm font-semibold'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live / Sample Mode Pill */}
            {airQuality && (
              <button
                onClick={toggleSampleDataMode}
                className="text-[11px] font-medium text-muted hover:text-ink px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block"
                title="Toggle Live / Sample data"
              >
                {airQuality.isSampleData ? '● Sample data' : '● Live API'}
              </button>
            )}

            {/* Sample Profiles Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowSampleMenu((prev) => !prev)}
                className="flex items-center gap-1 text-xs text-muted hover:text-ink px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all font-medium"
                aria-expanded={showSampleMenu}
                aria-label="Switch test profile"
              >
                <Users className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline">Profiles</span>
                <ChevronDown className="w-3 h-3 opacity-60" aria-hidden="true" />
              </button>

              {showSampleMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-surface border border-gray-200 dark:border-gray-800 shadow-lg p-2 z-50 text-left animate-fade-in"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Preset Profiles
                  </div>
                  {SAMPLE_PROFILES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        loadSampleProfile(sample.id);
                        setShowSampleMenu(false);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col gap-0.5"
                      role="menuitem"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>{sample.name}</span>
                        <span className="text-[10px] text-muted">{sample.tag}</span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-1">{sample.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Print View */}
            <button
              onClick={() => window.print()}
              title="Print Action Plan"
              aria-label="Print Action Plan"
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => loadAirQuality(true)}
              disabled={airQualityLoading}
              title="Refresh live air data"
              aria-label="Refresh live air data"
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${airQualityLoading ? 'animate-spin text-primary' : ''}`}
                aria-hidden="true"
              />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {/* Clear Data */}
            {profile && (
              <button
                onClick={() => setShowClearConfirm(true)}
                title="Reset stored data"
                aria-label="Reset stored data"
                className="p-2 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
        >
          <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h2 id="clear-dialog-title" className="font-heading font-bold text-base text-ink">
              Clear your profile data?
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              This will remove your location and household settings from local storage.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => {
                  clearAllUserData();
                  setShowClearConfirm(false);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
