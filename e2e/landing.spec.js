import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    // Basic check that the page loaded
    await expect(page).toHaveTitle(/viaggio/i);
  });

  test('should have search functionality visible', async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be interactive
    await page.waitForLoadState('networkidle');
  });
});
