import React, { useState } from 'react';
import {
  MapPin,
  Home,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  AlertCircle,
  Shield,
  LocateFixed,
} from 'lucide-react';
import {
  UserProfile,
  LocationData,
  HomeType,
  CommuteMode,
  CookingFuel,
  HeatingMethod,
  WorkEnvironment,
  BudgetLevel,
} from '@/types';
import { SAMPLE_PROFILES, POPULAR_CITIES } from '@/shared/lib/constants';
import { roundCoordinates, sanitizeHouseholdSize } from '@/shared/lib/sanitize';
import { searchCities } from '@/services/geocoding';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Location
  const [location, setLocation] = useState<LocationData>({
    name: 'New Delhi (Central)',
    latitude: 28.61,
    longitude: 77.21,
  });
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<LocationData[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoPending, setGeoPending] = useState(false);

  // Step 2: Household
  const [membersCount, setMembersCount] = useState<number>(3);
  const [hasSensitiveMembers, setHasSensitiveMembers] = useState<boolean>(true);
  const [homeType, setHomeType] = useState<HomeType>('apartment');
  const [windowSealing, setWindowSealing] = useState<'sealed' | 'standard' | 'drafty'>('standard');
  const [hasAC, setHasAC] = useState<boolean>(true);
  const [hasPurifier, setHasPurifier] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);

  // Step 3: Lifestyle
  const [commuteMode, setCommuteMode] = useState<CommuteMode>('car');
  const [commuteDistanceKm, setCommuteDistanceKm] = useState<number>(12);
  const [cookingFuel, setCookingFuel] = useState<CookingFuel>('gas');
  const [heatingMethod, setHeatingMethod] = useState<HeatingMethod>('space_heater');
  const [workEnvironment, setWorkEnvironment] = useState<WorkEnvironment>('office');
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('low');

  // Handle browser geolocation with graceful denial
  const handleRequestGeolocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please search your city below.');
      return;
    }

    setGeoPending(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPending(false);
        const lat = roundCoordinates(pos.coords.latitude);
        const lon = roundCoordinates(pos.coords.longitude);
        setLocation({
          name: `My Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          latitude: lat,
          longitude: lon,
          isSample: false,
        });
      },
      (err) => {
        setGeoPending(false);
        let msg = 'Location permission was denied. We defaulted to search mode.';
        if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please select your city manually.';
        }
        setGeoError(msg);
      },
      { timeout: 8000 }
    );
  };

  // City Search
  const handleCitySearch = async (val: string) => {
    setCitySearchQuery(val);
    setGeoError(null);
    if (val.trim().length < 2) {
      setCitySearchResults([]);
      return;
    }

    setIsSearchingCities(true);
    const res = await searchCities(val);
    setIsSearchingCities(false);
    if (res.ok) {
      setCitySearchResults(res.data);
    }
  };

  const handleFinish = () => {
    const defaultAges = Array.from({ length: membersCount }, (_, i) => (i === 0 ? 32 : i === 1 ? 8 : 65));

    const finalProfile: UserProfile = {
      location,
      household: {
        membersCount: sanitizeHouseholdSize(membersCount),
        ages: defaultAges,
        hasSensitiveMembers,
        homeType,
        ventilation: {
          windows: windowSealing,
          hasAC,
          hasPurifier,
        },
        hasPets,
      },
      lifestyle: {
        commuteMode,
        commuteDistanceKm,
        cookingFuel,
        heatingMethod,
        workEnvironment,
        budgetLevel,
      },
      onboardingCompleted: true,
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    onComplete(finalProfile);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Wizard Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-ink tracking-tight">
          Welcome to Exhale
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-lg mx-auto">
          Winter smog hits every home differently. Tell us about your living setup to get tailored low-emission routines and indoor air hacks.
        </p>

        {/* Quick Reviewer Samples Skip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted">
            Quick start with a profile:
          </span>
          {SAMPLE_PROFILES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onComplete(sample.profile)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface hover:border-gray-400 dark:hover:border-gray-500 text-ink transition-colors font-medium"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div
        className="mb-8"
        role="progressbar"
        aria-label="Onboarding Progress"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={3}
      >
        <div className="flex items-center justify-between text-xs font-semibold text-muted mb-2">
          <span className={step >= 1 ? 'text-primary font-bold' : ''}>1. Location & Air</span>
          <span className={step >= 2 ? 'text-primary font-bold' : ''}>2. Household & Home</span>
          <span className={step >= 3 ? 'text-primary font-bold' : ''}>3. Lifestyle & Commute</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div aria-live="polite" className="sr-only">
          Step {step} of 3
        </div>
      </div>

      {/* STEP 1: Location */}
      {step === 1 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-ink flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
              Where do you breathe?
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              We fetch hourly AQI, PM2.5, and inversions from Open-Meteo. Coordinates are rounded to 2 decimals for privacy.
            </p>
          </div>

          {/* Current selected location pill */}
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
              <span className="font-semibold text-sm text-teal-900 dark:text-teal-200">
                Selected: {location.name}
              </span>
            </div>
            <span className="text-xs text-muted">
              ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
            </span>
          </div>

          {/* Browser Geolocation Button */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleRequestGeolocation}
              isLoading={geoPending}
              className="w-full flex items-center justify-center gap-2 border-primary/40 text-primary-text font-semibold hover:bg-teal-50/50"
            >
              <LocateFixed className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Use Current Device Location</span>
            </Button>
            <p className="text-[11px] text-muted text-center flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              Location data is stored locally only on your device and never uploaded.
            </p>
          </div>

          {geoError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{geoError}</span>
            </div>
          )}

          {/* City Search Bar */}
          <div className="space-y-2">
            <label htmlFor="city-search" className="block text-xs font-bold text-ink uppercase tracking-wide">
              Or search any city or region
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted pointer-events-none" aria-hidden="true" />
              <input
                id="city-search"
                type="text"
                value={citySearchQuery}
                onChange={(e) => handleCitySearch(e.target.value)}
                placeholder="Search e.g. Delhi, Beijing, London, Salt Lake City..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {isSearchingCities && (
                <div className="absolute right-3.5 top-3.5 text-xs text-muted animate-spin">
                  ⏳
                </div>
              )}
            </div>

            {/* City search results dropdown */}
            {citySearchResults.length > 0 && (
              <ul className="rounded-xl border border-gray-200 dark:border-gray-700 bg-surface divide-y divide-gray-100 dark:divide-gray-800 max-h-48 overflow-y-auto shadow-md">
                {citySearchResults.map((city, idx) => (
                  <li key={`${city.name}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation(city);
                        setCitySearchQuery('');
                        setCitySearchResults([]);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-ink hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center justify-between"
                    >
                      <span className="font-medium">{city.name}</span>
                      <span className="text-muted text-[11px]">
                        {city.latitude}°, {city.longitude}°
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Popular Hotspots Shortcuts */}
          <div className="space-y-2 pt-2">
            <span className="text-xs text-muted block font-medium">Quick hotspots:</span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setLocation(c)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    location.name === c.name
                      ? 'bg-primary text-white border-primary font-bold'
                      : 'bg-canvas text-muted border-gray-200 dark:border-gray-700 hover:text-ink'
                  }`}
                >
                  {c.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              className="flex items-center gap-2"
            >
              <span>Next: Household</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Household */}
      {step === 2 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-ink flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" aria-hidden="true" />
              Household & Indoor Environment
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Different home types and ventilation setups require specific filtration strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Household Members Count */}
            <div className="space-y-1.5">
              <label htmlFor="members-count" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Household Members
              </label>
              <input
                id="members-count"
                type="number"
                min={1}
                max={20}
                value={membersCount}
                onChange={(e) => setMembersCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* Home Type */}
            <div className="space-y-1.5">
              <label htmlFor="home-type" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Home Type
              </label>
              <select
                id="home-type"
                value={homeType}
                onChange={(e) => setHomeType(e.target.value as HomeType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="apartment">Apartment / High-rise</option>
                <option value="flat">Shared Flat / Rented Room</option>
                <option value="house">Detached / Standalone House</option>
                <option value="studio">Studio Flat</option>
              </select>
            </div>
          </div>

          {/* Sensitive Members Toggle */}
          <div className="p-3.5 rounded-xl bg-canvas border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="sensitive-members" className="font-semibold text-sm text-ink block cursor-pointer">
                Sensitive Members (Kids, Elders, Asthma)
              </label>
              <p className="text-xs text-muted">
                Provides extra precaution advice and stricter exposure windows.
              </p>
            </div>
            <input
              id="sensitive-members"
              type="checkbox"
              checked={hasSensitiveMembers}
              onChange={(e) => setHasSensitiveMembers(e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
            />
          </div>

          {/* Window Sealing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink uppercase tracking-wide">
              Window Sealing & Drafts
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'sealed', label: 'Tight / Weatherstripped' },
                  { id: 'standard', label: 'Standard Windows' },
                  { id: 'drafty', label: 'Drafty / Gaps' },
                ] as const
              ).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWindowSealing(w.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    windowSealing === w.id
                      ? 'border-primary bg-primary/10 text-primary-text font-bold'
                      : 'border-gray-200 dark:border-gray-700 bg-canvas text-muted hover:text-ink'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ventilation equipment & Pets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-canvas flex items-center gap-2.5 cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={hasPurifier}
                onChange={(e) => setHasPurifier(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-xs font-semibold text-ink">Owns Air Purifier</span>
            </label>

            <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-canvas flex items-center gap-2.5 cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={hasAC}
                onChange={(e) => setHasAC(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-xs font-semibold text-ink">Has AC / Heat Pump</span>
            </label>

            <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-canvas flex items-center gap-2.5 cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={hasPets}
                onChange={(e) => setHasPets(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-xs font-semibold text-ink">Has Furry Pets</span>
            </label>
          </div>

          {/* Step 2 Actions */}
          <div className="pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(3)}
              className="flex items-center gap-2"
            >
              <span>Next: Lifestyle</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Lifestyle */}
      {step === 3 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-ink flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" aria-hidden="true" />
              Lifestyle, Commute & Heating
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              We calculate realistic emissions and recommend cleaner daily alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commute Mode */}
            <div className="space-y-1.5">
              <label htmlFor="commute-mode" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Primary Commute Mode
              </label>
              <select
                id="commute-mode"
                value={commuteMode}
                onChange={(e) => setCommuteMode(e.target.value as CommuteMode)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="car">Gasoline / Diesel Car</option>
                <option value="two_wheeler">Two-Wheeler (Scooter/Motorcycle)</option>
                <option value="public_transit">Public Transit (Metro / Bus)</option>
                <option value="bike">Bicycle / E-bike</option>
                <option value="walk">Walking</option>
              </select>
            </div>

            {/* Commute Distance */}
            <div className="space-y-1.5">
              <label htmlFor="commute-dist" className="block text-xs font-bold text-ink uppercase tracking-wide">
                One-Way Distance ({commuteDistanceKm} km)
              </label>
              <input
                id="commute-dist"
                type="range"
                min={1}
                max={50}
                value={commuteDistanceKm}
                onChange={(e) => setCommuteDistanceKm(parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cooking Fuel */}
            <div className="space-y-1.5">
              <label htmlFor="cooking-fuel" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Cooking Fuel
              </label>
              <select
                id="cooking-fuel"
                value={cookingFuel}
                onChange={(e) => setCookingFuel(e.target.value as CookingFuel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="gas">LPG / Natural Gas Burner</option>
                <option value="electric">Electric / Induction</option>
                <option value="wood_biomass">Wood / Biomass / Coal</option>
              </select>
            </div>

            {/* Heating Method */}
            <div className="space-y-1.5">
              <label htmlFor="heating-method" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Winter Heating Method
              </label>
              <select
                id="heating-method"
                value={heatingMethod}
                onChange={(e) => setHeatingMethod(e.target.value as HeatingMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="space_heater">Electric Space Heater</option>
                <option value="central">Central Heating (Radiator/HVAC)</option>
                <option value="firewood">Fireplace / Wood Stove</option>
                <option value="none">No Artificial Heating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work Environment */}
            <div className="space-y-1.5">
              <label htmlFor="work-env" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Work Environment
              </label>
              <select
                id="work-env"
                value={workEnvironment}
                onChange={(e) => setWorkEnvironment(e.target.value as WorkEnvironment)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="office">Indoor Office Building</option>
                <option value="remote">Work from Home / Remote</option>
                <option value="outdoor">Outdoor / Field Work</option>
              </select>
            </div>

            {/* Upgrade Budget Level */}
            <div className="space-y-1.5">
              <label htmlFor="budget-level" className="block text-xs font-bold text-ink uppercase tracking-wide">
                Budget for Air Upgrades
              </label>
              <select
                id="budget-level"
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(e.target.value as BudgetLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-canvas text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="free">Free / Zero Cost Hacks Only</option>
                <option value="low">Low Budget (DIY & Under $50)</option>
                <option value="flexible">Flexible / Any High-Impact Solution</option>
              </select>
            </div>
          </div>

          {/* Finish Actions */}
          <div className="pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleFinish}
              className="flex items-center gap-2 font-bold px-6"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Generate My Game Plan</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
