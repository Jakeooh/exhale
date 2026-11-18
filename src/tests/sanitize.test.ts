import { describe, it, expect } from 'vitest';
import {
  roundCoordinates,
  roundLocationCoords,
  sanitizeText,
  sanitizeHouseholdSize,
  sanitizeAge,
  sanitizeDistance,
} from '@/shared/lib/sanitize';

describe('Sanitizer & Location Privacy Utilities', () => {
  it('rounds coordinates to 2 decimal places (~1.1 km privacy radius)', () => {
    expect(roundCoordinates(28.6139281)).toBe(28.61);
    expect(roundCoordinates(77.2090212)).toBe(77.21);
    expect(roundCoordinates(-111.891045)).toBe(-111.89);

    const rounded = roundLocationCoords(40.76078, -111.89105);
    expect(rounded.latitude).toBe(40.76);
    expect(rounded.longitude).toBe(-111.89);
  });

  it('handles invalid coordinate inputs gracefully', () => {
    expect(roundCoordinates(NaN)).toBe(0);
    // @ts-expect-error test non-number
    expect(roundCoordinates(undefined)).toBe(0);
  });

  it('sanitizes user text inputs, strips control characters, and escapes brackets', () => {
    const raw = '   <script>alert("hack")</script>\u0000\u0007Hello World   ';
    const cleaned = sanitizeText(raw, 50);

    expect(cleaned).not.toContain('<');
    expect(cleaned).not.toContain('>');
    expect(cleaned).toContain('&lt;script&gt;');
    expect(cleaned).not.toContain('\u0000');
    expect(cleaned).not.toContain('\u0007');
    expect(cleaned.startsWith(' ')).toBe(false);
  });

  it('enforces maximum character length caps', () => {
    const long = 'a'.repeat(300);
    expect(sanitizeText(long, 50).length).toBe(50);
  });

  it('clamps household member counts between 1 and 20', () => {
    expect(sanitizeHouseholdSize(0)).toBe(1);
    expect(sanitizeHouseholdSize(-5)).toBe(1);
    expect(sanitizeHouseholdSize(4)).toBe(4);
    expect(sanitizeHouseholdSize(25)).toBe(20);
    expect(sanitizeHouseholdSize('7')).toBe(7);
    expect(sanitizeHouseholdSize('invalid')).toBe(1);
  });

  it('clamps age values between 0 and 120', () => {
    expect(sanitizeAge(-1)).toBe(0);
    expect(sanitizeAge(0)).toBe(0);
    expect(sanitizeAge(28)).toBe(28);
    expect(sanitizeAge(150)).toBe(120);
    expect(sanitizeAge('42')).toBe(42);
    expect(sanitizeAge('invalid')).toBe(25);
  });

  it('clamps commute distance between 0 and 200 km', () => {
    expect(sanitizeDistance(-10)).toBe(0);
    expect(sanitizeDistance(15.42)).toBe(15.4);
    expect(sanitizeDistance(300)).toBe(200);
  });
});
