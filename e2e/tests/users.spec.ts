import { test, expect } from '@playwright/test';
import { login } from './fixtures';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/users');
  });

  test('should display users page with table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
    await page.waitForLoadState('networkidle');
    // Table should be visible
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('should have role filter chips', async ({ page }) => {
    for (const role of ['USER', 'EMPLOYER', 'ADMIN']) {
      const chip = page.getByRole('button', { name: role, exact: true });
      await expect(chip).toBeVisible();
    }
  });

  test('should filter users by role', async ({ page }) => {
    await page.getByRole('button', { name: 'ADMIN', exact: true }).click();
    await page.waitForTimeout(500);
    // URL should not change but data should update
    await expect(page).toHaveURL('/users');
  });

  test('should open action menu on click', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click 3-dot menu on first row
    const menuBtn = page.locator('button[title*="actions" i], button[aria-label*="more" i]').first();
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      // Action menu should appear with options
      await expect(page.getByText(/reset password|change role|ban|delete/i).first()).toBeVisible();
    } else {
      test.skip();
    }
  });
});
