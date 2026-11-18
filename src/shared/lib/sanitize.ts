/**
 * @file Sanitization, coordinate rounding, and input boundary security utilities
 */

/**
 * Rounds geographic latitude and longitude to 2 decimal places (~1.1 km precision).
 * Prevents exact geolocation tracking and fingerprinting while retaining city/suburb air quality accuracy.
 */
export function roundCoordinates(coord: number): number {
  if (typeof coord !== 'number' || isNaN(coord)) return 0;
  return Math.round(coord * 100) / 100;
}

/**
 * Rounds both latitude and longitude of a location object to 2 decimal places.
 */
export function roundLocationCoords(lat: number, lon: number): { latitude: number; longitude: number } {
  return {
    latitude: roundCoordinates(lat),
    longitude: roundCoordinates(lon),
  };
}

/**
 * Sanitizes generic user text input:
 * - Trims leading/trailing whitespace
 * - Strips ASCII control characters (0x00-0x1F, 0x7F)
 * - Limits maximum string length
 * - Neutralizes HTML tag brackets
 */
export function sanitizeText(input: unknown, maxLength = 200): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    // Remove control characters (including null bytes and backspaces)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Replace raw HTML bracket delimiters with standard safe characters
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, maxLength);
}

/**
 * Validates and clamps household member count between 1 and 20.
 */
export function sanitizeHouseholdSize(size: unknown): number {
  const num = typeof size === 'number' ? size : parseInt(String(size), 10);
  if (isNaN(num)) return 1;
  return Math.max(1, Math.min(20, Math.floor(num)));
}

/**
 * Validates and clamps member age between 0 and 120.
 */
export function sanitizeAge(age: unknown): number {
  const num = typeof age === 'number' ? age : parseInt(String(age), 10);
  if (isNaN(num)) return 25;
  return Math.max(0, Math.min(120, Math.floor(num)));
}

/**
 * Sanitizes array of household ages.
 */
export function sanitizeAgesArray(ages: unknown[]): number[] {
  if (!Array.isArray(ages)) return [30];
  const cleaned = ages.map(sanitizeAge);
  return cleaned.length > 0 ? cleaned.slice(0, 20) : [30];
}

/**
 * Sanitizes commute distance (0 to 200 km).
 */
export function sanitizeDistance(dist: unknown): number {
  const num = typeof dist === 'number' ? dist : parseFloat(String(dist));
  if (isNaN(num) || num < 0) return 0;
  return Math.min(200, Math.round(num * 10) / 10);
}
