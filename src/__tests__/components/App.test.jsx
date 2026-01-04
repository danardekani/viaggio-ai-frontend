import { describe, it, expect, vi } from 'vitest';

// Basic smoke test
describe('App', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have test environment configured', () => {
    expect(vi).toBeDefined();
  });
});
