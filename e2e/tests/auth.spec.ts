import { test, expect } from '@playwright/test';
import { login, logout, clearAuth, TEST_USER } from './fixtures';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/');
    // Dashboard should be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Error toast or message should appear
    await expect(page.locator('text=/invalid|incorrect|failed/i').first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login on protected route', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/users');
    await expect(page).toHaveURL('/login');
  });
});
