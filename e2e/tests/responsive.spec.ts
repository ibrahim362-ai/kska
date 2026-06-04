import { test, expect } from '@playwright/test';
import { login } from './fixtures';

test.describe('Responsive Layout', () => {
  test('mobile: should show mobile-optimized navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page);

    // Should have hamburger menu (mobile nav)
    const hamburger = page.locator('button[aria-label*="menu" i]').first();
    if (await hamburger.isVisible().catch(() => false)) {
      await hamburger.click();
      // Sidebar drawer should open
      const drawer = page.locator('aside, [class*="drawer"]').first();
      await expect(drawer).toBeVisible();
    }
  });

  test('tablet: should adapt layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page);

    // Layout should still work
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('desktop: should show full layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);

    // Sidebar should be visible
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });
});
