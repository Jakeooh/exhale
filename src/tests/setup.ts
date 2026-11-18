import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock window.scrollTo and scrollIntoView
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

// Mock fetch by default
globalThis.fetch = globalThis.fetch || (() => Promise.reject(new Error('Fetch not mocked')));
