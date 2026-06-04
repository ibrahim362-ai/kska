import { test, expect } from '@playwright/test';
import { login } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard with stat cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    // Wait for stats to load
    await page.waitForLoadState('networkidle');

    // Should have at least some stat cards
    const cards = page.locator('[class*="rounded-2xl"]').filter({ hasText: /users|posts|votes|tickets/i });
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });

  test('should show real-time connection indicator', async ({ page }) => {
    const indicator = page.locator('text=/live|offline/i').first();
    await expect(indicator).toBeVisible();
  });

  test('should navigate to users page', async ({ page }) => {
    await page.getByRole('link', { name: /users/i }).first().click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
  });

  test('should navigate to payments page', async ({ page }) => {
    await page.getByRole('link', { name: /payments/i }).first().click();
    await expect(page).toHaveURL('/payments');
  });

  test('should show sidebar on desktop, drawer on mobile', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      // Mobile: sidebar hidden, hamburger visible
      const hamburger = page.locator('button[aria-label*="menu" i]').first();
      await expect(hamburger).toBeVisible();
    } else {
      // Desktop: sidebar visible
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      await expect(sidebar).toBeVisible();
    }
  });
});
