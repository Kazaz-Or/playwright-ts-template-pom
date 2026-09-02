import { test, expect } from '../fixtures/base.fixture';
import { Routes } from '../constants/routes.enum';

test.describe('Responsive Design', () => {
  test('homepage should render on mobile viewport @sanity', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(Routes.Home);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('homepage should render on tablet viewport @regression', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(Routes.Home);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('blog post should be readable on mobile @regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/blogs/playwright-sounds-test');
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('footer should be visible on all viewports @regression', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ];
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(Routes.Home);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.locator('footer')).toBeVisible();
    }
  });
});
