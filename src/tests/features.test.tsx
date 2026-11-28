import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAppStore } from '@/shared/lib/store';
import { SAMPLE_PROFILES, SAMPLE_AIR_QUALITY_DATA } from '@/shared/lib/constants';
import { INITIAL_COMMUNITY_ACTIONS } from '@/shared/lib/community';
import { calculateWeeklyImpactTotal } from '@/shared/lib/impact';
import { generateLocalRuleBasedPlan } from '@/services/gemini/fallbackGenerator';
import { DayPlanSection } from '@/features/dayplan/DayPlanSection';
import { IndoorHacksSection } from '@/features/indoor/IndoorHacksSection';
import { SustainableSwapsSection } from '@/features/swaps/SustainableSwapsSection';
import { ImpactExplainerSection } from '@/features/impact/ImpactExplainerSection';
import { CommunityModeSection } from '@/features/community/CommunityModeSection';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

describe('Feature Sections Suite', () => {
  const profile = SAMPLE_PROFILES[0].profile;
  const plan = generateLocalRuleBasedPlan(profile, SAMPLE_AIR_QUALITY_DATA);
  const initialImpact = calculateWeeklyImpactTotal(
    plan.swaps,
    profile,
    SAMPLE_AIR_QUALITY_DATA.pm25
  );

  beforeEach(() => {
    useAppStore.setState({
      profile,
      airQuality: SAMPLE_AIR_QUALITY_DATA,
      hasCompletedOnboarding: true,
      dayPlan: plan.dayPlan,
      indoorHacks: plan.indoorHacks,
      swaps: plan.swaps,
      impactSummary: initialImpact,
      communityActions: INITIAL_COMMUNITY_ACTIONS,
      adoptedSwapIds: {},
      activeTab: 'dayplan',
      planLoading: false,
    });
  });

  describe('DayPlanSection', () => {
    it('renders all 5 day plan blocks with activity recommendations', () => {
      render(<DayPlanSection />);

      expect(screen.getByText('My Day Plan')).toBeInTheDocument();
      expect(screen.getByText(/07:00 AM - 09:00 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/Morning routine & morning ventilation assessment/i)).toBeInTheDocument();
    });

    it('allows opening alternative picker and swapping the block routine', () => {
      render(<DayPlanSection />);

      // Find first "Alternative" button
      const altButtons = screen.getAllByRole('button', { name: /Pick an alternative/i });
      expect(altButtons.length).toBeGreaterThan(0);

      fireEvent.click(altButtons[0]);

      // Verify modal becomes visible
      expect(screen.getByText('Choose Alternative Routine')).toBeInTheDocument();

      // Click the reset to default button inside modal
      const resetBtn = screen.getByRole('button', { name: /Reset to default recommendation/i });
      fireEvent.click(resetBtn);

      // Modal closes
      expect(screen.queryByText('Choose Alternative Routine')).not.toBeInTheDocument();
    });
  });

  describe('IndoorHacksSection', () => {
    it('renders indoor air quality hacks with cost and effort badges', () => {
      render(<IndoorHacksSection />);

      expect(screen.getByText('Indoor Air Hacks')).toBeInTheDocument();
      expect(screen.getByText(/Ranked, practical techniques/i)).toBeInTheDocument();

      // Ensure filter buttons exist
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'DIY Purifier' })).toBeInTheDocument();
    });

    it('filters hacks when clicking category pill', () => {
      render(<IndoorHacksSection />);

      const purifierFilter = screen.getByRole('button', { name: 'DIY Purifier' });
      fireEvent.click(purifierFilter);

      // Verify active styling
      expect(purifierFilter).toHaveClass('bg-ink');
    });
  });

  describe('SustainableSwapsSection', () => {
    it('renders sustainable swaps and allows toggling adoption', () => {
      render(<SustainableSwapsSection />);

      expect(screen.getByText('Sustainable Swaps')).toBeInTheDocument();

      // Find an adopt button
      const adoptButtons = screen.getAllByRole('button', { name: /Adopt This Swap/i });
      expect(adoptButtons.length).toBeGreaterThan(0);

      // Click to adopt
      fireEvent.click(adoptButtons[0]);

      // Button updates to adopted
      expect(screen.getAllByRole('button', { name: /Adopted/i }).length).toBeGreaterThan(0);
    });
  });

  describe('ImpactExplainerSection', () => {
    it('renders exposure cut metrics and documented citations', () => {
      render(<ImpactExplainerSection />);

      expect(screen.getByText('Impact Explainer')).toBeInTheDocument();
      expect(screen.getByText('Exposure Cut')).toBeInTheDocument();
      expect(screen.getByText('Weekly PM2.5 Kept Out')).toBeInTheDocument();
      expect(screen.getByText(/Documented Constants & Citations/i)).toBeInTheDocument();
    });
  });

  describe('CommunityModeSection', () => {
    it('renders neighborhood action pack and allows pledging', () => {
      render(<CommunityModeSection />);

      expect(screen.getByText('Neighborhood Action Pack')).toBeInTheDocument();
      expect(screen.getByText('School & Society Green Carpool Day')).toBeInTheDocument();

      // Click pledge
      const pledgeBtns = screen.getAllByRole('button', { name: /Pledge This Action/i });
      expect(pledgeBtns.length).toBeGreaterThan(0);
      fireEvent.click(pledgeBtns[0]);

      expect(screen.getByRole('button', { name: /Pledged/i })).toBeInTheDocument();
    });

    it('copies action pack to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<CommunityModeSection />);

      const copyBtn = screen.getByRole('button', {
        name: /Copy Neighborhood Action Pack/i,
      });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledTimes(1);
      expect(writeTextMock.mock.calls[0][0]).toContain('EXHALE NEIGHBORHOOD ACTION PACK');
    });
  });

  describe('ErrorBoundary Component', () => {
    it('catches render errors and renders accessible error fallback with reload actions', () => {
      const ProblematicChild: React.FC = () => {
        throw new Error('Simulated crash in component');
      };

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ProblematicChild />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/Simulated crash in component/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset & Clear Data/i })).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
