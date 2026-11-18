# 🌿 Exhale — GenAI Smog & Urban Air Quality Assistant

> A production-grade, privacy-first GenAI assistant that empowers urban families and communities to navigate severe winter smog and air pollution with science-backed, low-emission daily routines, indoor air quality hacks, sustainable lifestyle swaps, and transparent impact calculations.

---

## 🌟 Key Features

### 1. Problem Statement Alignment & Onboarding
- **3-Step Privacy-First Onboarding:**
  1. **Location:** Browser geolocation with clear permission explanations, graceful denial fallback, and city search. Geographic coordinates are strictly rounded to 2 decimal places (~1.1 km radius) to protect personal privacy while ensuring atmospheric smog accuracy.
  2. **Household Setup:** Member counts (1-20), ages, sensitive group toggles (asthma, children, elders), dwelling types (apartments, shared flats, standalone houses), ventilation setups (purifiers, AC/heat pumps, drafty vs. weatherstripped windows), and pets.
  3. **Lifestyle & Commute:** Commute modes (car, two-wheeler, public transit, bike, walk), one-way travel distances, cooking fuels (gas, induction/electric, biomass), heating methods (heat pump, central, space heater, firewood), work environments, and budget tiers (free, low, flexible).
- **3 One-Click Sample Profiles:**
  - *Young Family in Apartment* (Kids + Asthma, 4th floor city apartment, gas cooking).
  - *Retired Couple in House* (Elders + Cardiovascular sensitivities, drafty house, central heat).
  - *College Students Sharing Flat* (Budget-conscious, active commute, rented flat).

### 2. Live Smog Intelligence & Today's Air
- **Open-Meteo Air Quality Integration:** Fetches live US AQI and pollutant concentrations (PM2.5, PM10, NO2, O3) plus 48-hour forecasts without requiring any proprietary API keys.
- **Resilient Fallback Mode:** Seamlessly falls back to a clearly marked, realistic sample data mode if offline or if network connectivity is interrupted, with a one-click manual toggle between live and sample data.
- **Accessible AQI Gauge:** High-contrast semi-circular SVG sweep gauge with big friendly numerals, animated counters, textual category badges, and distinct icons (never color alone).
- **WHO 24-Hour Guideline Ratio:** Plain-language comparison (e.g., *"PM2.5 is 4.2x the WHO 24-hr guideline"* against the 15 µg/m³ threshold).
- **Best Outdoor Window Selection:** Automatically evaluates the 24-hour forecast curve to identify optimal outdoor activity periods while intelligently handling all-hazardous smog days (*"No safe outdoor window today; stay indoors"*) and all-clean days.

### 3. My Day Plan (GenAI Personalized Routines)
- **Time-Block Structure:** Breaks down 24 hours into 5 distinct periods: Morning (7-9 AM), Commute (9-10:30 AM), Midday (12-3 PM), Evening (5:30-8:30 PM), and Night Rest (9 PM - 7 AM).
- **Interactive Alternatives:** Every time block features an inline *"Pick Alternative"* option allowing users to swap routines based on their personal schedule constraints.
- **Single-Call Structured Generation:** The day plan, indoor hacks, and sustainable swaps are generated simultaneously in a single, efficient Gemini structured JSON call.

### 4. Indoor Air Hacks
- **Ranked Science-Backed Hacks:** Practical, actionable tips covering ventilation timing, DIY Corsi-Rosenthal box fan purifiers, wet-towel door dam sealing, two-zone kitchen exhaust protocols, and houseplant myths vs. humidity facts.
- **Clear Metadata Tags:** Every hack is tagged by cost (`free`, `low`, `flexible`), effort (`low`, `medium`, `high`), expected effect, and transparent particulate reduction percentages.

### 5. Sustainable Swaps & Impact Explainer (Key Feature)
- **Cleaner Alternatives:** Concrete substitutions for daily commute, cooking, heating, and household habits with honest trade-off disclosures.
- **Transparent Science in `src/shared/lib/impact.ts`:**
  - Inhalation exposure modeled using the **EPA Exposure Factors Handbook** (16 m³/day adult respiratory baseline).
  - Transport emissions derived from **UK DEFRA / US EPA GHG Conversion Factors**.
  - Indoor infiltration ratios based on **Lawrence Berkeley National Laboratory (LBNL)** and **ASHRAE** residential studies.
  - Cooking emissions based on **LBNL Unvented Gas Burner Field Studies**.
- **Before/After Visualization:** Interactive before vs. after animated inhalation exposure bars with weekly totals for PM2.5 grams avoided, CO2e kilograms mitigated, and overall exposure reduction percentages.
- **Strictly Labeled as Estimates:** Every figure is explicitly labeled as an estimate (*"Est."*) with on-tap citations to prevent pseudo-precision claims.

### 6. Community Mode (Neighborhood Action Pack)
- **5 Collective Community Actions:**
  1. *School & Society Green Carpool Day* (reduces gate congestion and tailpipe exhaust).
  2. *Zero Open-Burning & Green Waste Patrol* (tackles localized smoke plumes).
  3. *Mask & DIY Purifier Drive* (protects security guards, sanitation staff, and street workers).
  4. *Classroom & Common Area Clean-Air Check* (monitors ventilation in schools).
  5. *No-Idling Drop-Off Zone Enforcement* (cuts engine idling outside society gates).
- **Interactive Pledge Counter:** Locally persisted pledge log that updates community totals.
- **Share & Print Ready:** Includes one-click *"Copy Summary"* to clipboard and print formatting for flyers.

### 7. Ask Exhale (Streaming AI Assistant)
- **Context-Aware Assistance:** Answers user questions (*"Is it OK for my kid to cycle to school today?"*, *"How do I make a Corsi-Rosenthal box fan?"*) with real-time awareness of the current AQI, pollutants, and household setup.
- **Token-by-Token Streaming:** Streams responses dynamically with a persistent medical disclaimer.
- **Prompt-Injection Defense:** Treats user inputs strictly as encapsulated data, ignoring any embedded instructions or prompt injections.
- **Safe Text Rendering:** Renders plain text exclusively—never using `dangerouslySetInnerHTML`, `innerHTML`, or `eval`.

---

## 🎨 Design & Aesthetic

- **Design Language:** Airy minimalism, Gen Z casual-friendly tone, 20px radii (`rounded-card`), generous whitespace, and WCAG AA compliant contrast ratios.
- **Breathing Haze Hero:** The hero background subtly breathes using CSS gradients and opacity only; tint and density reflect current air severity.
- **Design Tokens:**
  - Canvas: `#F3F7F6` (mist) / `#0B1214` (dark)
  - Surface: `#FFFFFF` / `#131E22`
  - Ink: `#0D1B1E` / `#F2F7F8`
  - Muted: `#52656A` / `#8FA4AA`
  - Primary: `#14B8A6` (teal, `#0B7F73` for text on light)
  - Secondary: `#7C6CFF` (soft violet)
  - Highlight: `#FFD166` (warm sun)
  - AQI Tokens: Good `#2FBF71`, Moderate `#F2C94C`, Sensitive `#F2994A`, Unhealthy `#EB5757`, Very Unhealthy `#9B51E0`, Hazardous `#7B2D3B`.
- **Accessibility (WCAG 2.2 AA):**
  - Full keyboard navigation with visible 2px focus rings (`focus-visible:ring-2 focus-visible:ring-primary`).
  - Proper ARIA landmarks (`main`, `nav`, `header`, `footer`), `tablist`/`tab`/`tabpanel` semantics, and `aria-live="polite"` announcements.
  - Non-color reliance: every AQI level uses text badges, icons, and numerical ranges.
  - Respects `prefers-reduced-motion` to disable animations.
  - Touch targets meet or exceed 44×44px.

---

## 🏗️ Architecture & Project Structure

Feature-based modular structure:

```
src/
├── types/
│   └── index.ts                 # Strictly typed interfaces and Result<T, E> types
├── shared/
│   ├── lib/
│   │   ├── constants.ts         # AQI thresholds, WHO guidelines, sample profiles
│   │   ├── impact.ts            # EPA/LBNL/DEFRA documented impact formulas
│   │   ├── aqi.ts               # Categorization, WHO multiplier, best-window selection
│   │   ├── sanitize.ts          # Coordinate rounding, input validation, boundaries
│   │   ├── storage.ts           # Safe versioned localStorage wrapper
│   │   ├── schemas.ts           # Zod validation schemas
│   │   ├── community.ts         # Neighborhood action pack configuration
│   │   └── store.ts             # Zustand store with derived pure state
│   └── ui/
│       ├── Button.tsx           # Accessible 44px+ touch button
│       ├── Card.tsx             # 20px rounded card
│       ├── Badge.tsx            # Semantic tag badges
│       ├── Navbar.tsx           # Responsive header, sample profiles, print trigger
│       ├── TabBar.tsx           # Accessible tab navigation (desktop + mobile sticky)
│       ├── HazeHero.tsx         # AQI-reactive breathing gradient container
│       ├── DisclaimerBanner.tsx # Hazardous emergency alert & medical disclaimer
│       ├── NumberCounter.tsx    # Smooth animated number counter
│       ├── Skeleton.tsx         # Accessible shimmer loading state
│       └── PrintFamilyActionPlan.tsx # High-contrast print stylesheet view
├── services/
│   ├── airquality/              # Open-Meteo fetcher with 15-min cache & offline fallback
│   ├── geocoding/               # City search with debouncing & offline hotspots
│   └── gemini/                  # Structured generation, prompt defense & streaming chat
├── features/
│   ├── onboarding/              # 3-step wizard with geolocation & sample skip
│   ├── airnow/                  # Animated AQI gauge, sparkline & WHO comparison
│   ├── dayplan/                 # 5-block routine with alternative swaps
│   ├── indoor/                  # Ranked practical hacks with tags
│   ├── swaps/                   # Sustainable alternatives with trade-offs
│   ├── impact/                  # Before/after bars & weekly impact totals
│   ├── community/               # Neighborhood action pack & pledge counter
│   └── assistant/               # Streaming chat assistant
├── tests/
│   ├── setup.ts                 # Test setup, matchers, mock environment
│   ├── aqi.test.ts              # EPA cutoffs, WHO multipliers, best-window tests
│   ├── impact.test.ts           # EPA inhalation, commute, weekly totals tests
│   ├── sanitize.test.ts         # Coordinate rounding & input sanitization tests
│   ├── schemas.test.ts          # Zod validation schemas tests
│   ├── services.test.ts         # Service fetch mocking, timeout, abort tests
│   └── components.test.tsx      # Component interaction & vitest-axe accessibility tests
├── App.tsx                      # Main application container with lazy-loaded sections
└── main.tsx                     # React 19 entrypoint
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
# Navigate to the project directory
cd exhale

# Install dependencies
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```env
# Optional: Google Gemini API Key for dynamic AI plan generation and live streaming chat.
# If omitted, Exhale automatically falls back to its built-in rule-based GenAI engine,
# ensuring 100% of features function completely offline.
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Production Security Note:** In production, never expose AI API keys in client-side bundles. Route Gemini API calls through a secure server-side proxy or edge function.

### Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Automated Test Suite
Exhale comes with 47 automated unit, integration, and accessibility tests:
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Production Build
```bash
npm run build
```

---

## 🔒 Security & Privacy by Design

1. **Zero Client Secrets:** All API keys are loaded via environment variables; fallback engines ensure operation even when no keys are present.
2. **Safe Rendering:** Plain-text rendering is strictly enforced across all components—eliminating `dangerouslySetInnerHTML`, `innerHTML`, and `eval`.
3. **Coordinate Rounding:** User coordinates are rounded to 2 decimal places prior to API queries or local storage, obscuring precise locations while retaining local smog accuracy.
4. **Local Data Ownership:** User profiles, adopted swaps, and pledges are stored exclusively in the browser's `localStorage` under versioned keys. A *"Clear Personal Data"* button provides complete data purging at any time.
5. **Strict Content Security Policy (CSP):** `index.html` restricts network connections to trusted domains (`generativelanguage.googleapis.com`, `air-quality-api.open-meteo.com`, `geocoding-api.open-meteo.com`, Google Fonts).
6. **Input Boundary Enforcement:** Zod validates external data payloads, with sanitized bounds on numeric fields (household size 1-20, age 0-120, commute distance 0-200 km).

---

## 📚 Scientific Citations & Assumptions

- **Adult Inhalation Volume:** 16.0 m³/day (US EPA Exposure Factors Handbook, Chapter 6).
- **Child Inhalation Volume:** 10.0 m³/day (US EPA Exposure Factors Handbook).
- **Indoor Activity Partition:** 85% indoor / 15% outdoor (National Human Activity Pattern Survey - NHAPS).
- **Closed Window Infiltration:** 65% standard infiltration / 38% weatherstripped (Lawrence Berkeley National Laboratory / ASHRAE).
- **HEPA & Corsi-Rosenthal Filtration:** 72% particulate clearance in closed rooms (UC Davis / EPA Indoor Air Field Studies).
- **N95 Fit Efficiency:** 88-90% real-world particulate protection (NIOSH / CDC Respirator Studies).
- **Passenger Vehicle Emissions:** 0.170 kg CO2e/km (UK DEFRA / US EPA GHG Reporting Standards).
- **Gas Stove Indoor Byproducts:** 2.1g PM2.5 / 4.2 kg CO2e weekly without extraction hood (LBNL Indoor Cooking Emissions Study).

---

## 📄 License

MIT License. Open data provided by [Open-Meteo](https://open-meteo.com/) under CC BY 4.0.
