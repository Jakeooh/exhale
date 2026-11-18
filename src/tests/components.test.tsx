import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { TodaysAirCard } from '@/features/airnow/TodaysAirCard';
import { DisclaimerBanner } from '@/shared/ui/DisclaimerBanner';
import { AskExhaleChat } from '@/features/assistant/AskExhaleChat';
import { SAMPLE_AIR_QUALITY_DATA, SAMPLE_PROFILES } from '@/shared/lib/constants';

describe('OnboardingWizard Component', () => {
  it('renders step 1 and advances through steps', () => {
    const handleComplete = vi.fn();
    render(<OnboardingWizard onComplete={handleComplete} />);

    expect(screen.getByText('Where do you breathe?')).toBeInTheDocument();

    // Advance to Step 2
    const nextBtn = screen.getByRole('button', { name: /Next: Household/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Household & Indoor Environment')).toBeInTheDocument();

    // Advance to Step 3
    const nextLifestyleBtn = screen.getByRole('button', { name: /Next: Lifestyle/i });
    fireEvent.click(nextLifestyleBtn);

    expect(screen.getByText('Lifestyle, Commute & Heating')).toBeInTheDocument();

    // Finish
    const finishBtn = screen.getByRole('button', { name: /Generate My Game Plan/i });
    fireEvent.click(finishBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(handleComplete.mock.calls[0][0].onboardingCompleted).toBe(true);
  });

  it('handles browser geolocation denial gracefully without crashing', async () => {
    // Mock navigator.geolocation error
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success, error) => {
        error({ code: 1, message: 'User denied geolocation', TIMEOUT: 3 });
      }),
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    render(<OnboardingWizard onComplete={vi.fn()} />);

    const geoBtn = screen.getByRole('button', { name: /Use Current Device Location/i });
    fireEvent.click(geoBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Location permission was denied. We defaulted to search mode./i)
      ).toBeInTheDocument();
    });
  });

  it('allows one-click start using sample profiles', () => {
    const handleComplete = vi.fn();
    render(<OnboardingWizard onComplete={handleComplete} />);

    const familySampleBtn = screen.getByRole('button', {
      name: SAMPLE_PROFILES[0].name,
    });
    fireEvent.click(familySampleBtn);

    expect(handleComplete).toHaveBeenCalledWith(SAMPLE_PROFILES[0].profile);
  });
});

describe("Today's Air Card Component", () => {
  it('renders AQI, WHO comparison line, and best outdoor window', () => {
    render(
      <TodaysAirCard
        data={SAMPLE_AIR_QUALITY_DATA}
        locationName="New Delhi"
      />
    );

    expect(screen.getByText(/Today's Air/i)).toBeInTheDocument();
    expect(screen.getByText(/New Delhi/i)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_AIR_QUALITY_DATA.whoComparison)).toBeInTheDocument();
    expect(screen.getByText(/Best Window Outside/i)).toBeInTheDocument();
  });
});

describe('Disclaimer & Hazardous Banner Component', () => {
  it('shows calm emergency alert banner when air quality is Hazardous (AQI >= 300)', () => {
    render(<DisclaimerBanner category="hazardous" aqi={340} />);

    expect(screen.getByText(/Severe Smog Emergency Alert/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay indoors/i)).toBeInTheDocument();
  });

  it('does not show emergency banner on moderate days, only general advisory', () => {
    render(<DisclaimerBanner category="moderate" aqi={65} />);

    expect(screen.queryByText(/Severe Smog Emergency Alert/i)).not.toBeInTheDocument();
    expect(screen.getByText(/General advisory only/i)).toBeInTheDocument();
  });
});

describe('Ask Exhale Chat Component', () => {
  it('renders input and suggested questions safely as plain text', () => {
    render(<AskExhaleChat />);

    expect(screen.getByText('Ask Exhale')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ask anything/i)
    ).toBeInTheDocument();

    const chip = screen.getByRole('button', {
      name: 'How do I build a DIY box fan filter?',
    });
    expect(chip).toBeInTheDocument();
  });
});

describe('Accessibility (WCAG AA via vitest-axe)', () => {
  it('has zero accessibility violations on OnboardingWizard', async () => {
    const { container } = render(<OnboardingWizard onComplete={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has zero accessibility violations on Today's Air Card", async () => {
    const { container } = render(
      <TodaysAirCard
        data={SAMPLE_AIR_QUALITY_DATA}
        locationName="London"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
