// Jest setup file
// Add any global test setup here

require('@testing-library/jest-dom');

// Mock scrollIntoView for jsdom (not implemented in jsdom)
Element.prototype.scrollIntoView = jest.fn();

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
