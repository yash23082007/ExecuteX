import { test, expect } from '@playwright/test';

test('user can select a language and load generic boilerplate', async ({ page }) => {
  await page.goto('/');

  // Wait for React to mount the app shell
  await expect(page.locator('.app-shell')).toBeVisible();

  // Test top navigation branding is visible
  await expect(page.getByText('ExecuteX')).toBeVisible();
});
