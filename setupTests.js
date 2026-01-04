import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn(cb => setTimeout(cb, 0));
global.cancelIdleCallback = vi.fn(id => clearTimeout(id));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
