import { test, expect } from '@playwright/test';

test.describe('ExecuteX E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Mock the backend API routes for hermetic testing
    await page.route('**/api/v1/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', uptime: 100, timestamp: new Date().toISOString() }),
      });
    });

    await page.route('**/api/v1/ai/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.route('**/api/v1/execute', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: '0',
          signal: '',
          compiler_output: '',
          compiler_error: '',
          compiler_message: '',
          program_output: 'Hello, Python!\n',
          program_error: '',
          program_message: 'Hello, Python!\n',
          provider: 'wandbox'
        }),
      });
    });

    await page.route('**/api/v1/share', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            share: {
              slug: 'test-shared-123',
              language: 'python',
              code: 'print("Hello, Python!")'
            }
          }),
        });
      }
    });

    await page.route('**/api/v1/ai/review', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          suggestions: [
            {
              line: 1,
              severity: 'improvement',
              title: 'Looks great! Try adding a comment.',
              detail: 'Adding comments is a good developer practice.'
            }
          ]
        }),
      });
    });

    // Go to homepage
    await page.goto('/');
  });

  test('user can select a language and load boilerplate', async ({ page }) => {
    // Wait for the app shell to mount
    await expect(page.locator('.app-shell')).toBeVisible();

    // Verify default boilerplate exists in editor (should be Python)
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible();

    // Open language selector
    const langBtn = page.locator('.lang__btn');
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // Choose Javascript
    const jsItem = page.locator('.dd__item').filter({ hasText: 'JavaScript' });
    await expect(jsItem).toBeVisible();
    await jsItem.click();

    // The button label should update to JavaScript
    await expect(page.locator('.lang__label')).toContainText('JavaScript');
  });

  test('user can execute code and view output', async ({ page }) => {
    await expect(page.locator('.app-shell')).toBeVisible();

    // Click run button
    const runBtn = page.getByRole('button', { name: /run code/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Verify terminal prints output
    const terminal = page.locator('.term__out');
    await expect(terminal).toContainText('Hello, Python!');
  });

  test('user can share code snippet', async ({ page }) => {
    await expect(page.locator('.app-shell')).toBeVisible();

    // Click share button
    const shareBtn = page.locator('.share-btn');
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // Wait for sharing loading to finish and display share toast
    const shareToast = page.locator('.share-toast');
    await expect(shareToast).toBeVisible();

    // Verify the share URL is shown
    const shareText = page.locator('.share-toast__text');
    await expect(shareText).toHaveAttribute('href', /test-shared-123/);
  });

  test('user can trigger AI review and see suggestions panel', async ({ page }) => {
    await expect(page.locator('.app-shell')).toBeVisible();

    // Sparkles toggle is visible and active
    const aiToggle = page.locator('.ai-toggle');
    await expect(aiToggle).toBeVisible();

    // AI Review button is visible
    const reviewBtn = page.locator('.nav__ai-review-btn');
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    // Verify review panel opens
    const reviewPanel = page.locator('.ai-review');
    await expect(reviewPanel).toBeVisible();

    // Verify suggestion is listed
    await expect(reviewPanel.locator('.ai-review__item')).toBeVisible();
    await expect(reviewPanel.locator('.ai-review__item-title')).toContainText('Looks great!');
  });

});
