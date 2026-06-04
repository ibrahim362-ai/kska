import { test, expect, type Page } from '@playwright/test';

/**
 * Test fixtures and helpers for Community Hub E2E tests
 */

export const TEST_USER = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@community.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  fullName: 'Test Admin',
};

export async function login(page: Page, user = TEST_USER) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('/', { timeout: 10000 });
}

export async function logout(page: Page) {
  // Click profile menu
  await page.locator('[data-testid="user-menu-button"]').click();
  await page.getByRole('button', { name: /logout/i }).click();
  await page.waitForURL('/login');
}

export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
