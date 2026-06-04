import { test, expect } from '@playwright/test';
import { login } from './fixtures';

test.describe('Manual Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/payments');
  });

  test('should display payments page with tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /manual payment proofs/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /all transactions/i })).toBeVisible();
  });

  test('should show status filter chips', async ({ page }) => {
    const chips = page.locator('[class*="rounded-lg"]').filter({ hasText: /pending|approved|rejected|all/i });
    expect(await chips.count()).toBeGreaterThan(0);
  });

  test('should open approve dialog when clicking approve', async ({ page }) => {
    // Wait for proofs to load
    await page.waitForLoadState('networkidle');

    // Find first approve button (if any)
    const approveBtn = page.getByRole('button', { name: /approve/i }).first();
    if (await approveBtn.isVisible().catch(() => false)) {
      await approveBtn.click();
      // Confirm dialog should appear
      await expect(page.getByText(/approve.*payment|confirm/i).first()).toBeVisible();
    } else {
      // No pending proofs - test should pass
      test.skip();
    }
  });

  test('should require rejection reason when rejecting', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const rejectBtn = page.getByRole('button', { name: /reject/i }).first();
    if (await rejectBtn.isVisible().catch(() => false)) {
      await rejectBtn.click();
      // Modal should ask for reason
      await expect(page.locator('input[placeholder*="reason" i]')).toBeVisible();
    } else {
      test.skip();
    }
  });
});
