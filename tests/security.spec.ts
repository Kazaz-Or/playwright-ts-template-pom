import { test, expect } from '../fixtures/base.fixture';
import { TestDataFactory } from '../data/factory';

test.describe('Security Boundary Tests', () => {
  test('search should handle XSS payloads safely @regression', async ({ homePage }) => {
    await homePage.navigate();
    const payloads = TestDataFactory.xssPayloads();

    for (const payload of payloads) {
      await homePage.navbar.search(payload);
      // Should not execute script — page should remain stable
      const title = await homePage.page.title();
      expect(title).not.toContain('xss');
      await homePage.navbar.clearSearch();
    }
  });

  test('non-existent routes with special chars should not crash @regression', async ({ page }) => {
    const paths = [
      '/blogs/<script>alert(1)</script>',
      '/blogs/../../etc/passwd',
      '/tags/%00%01%02',
      '/blogs/' + encodeURIComponent("'; DROP TABLE --"),
    ];

    for (const path of paths) {
      const response = await page.goto(path);
      // Should return 404 or redirect, never 500
      const status = response?.status() ?? 0;
      expect(status, `${path} returned ${status}`).not.toBe(500);
    }
  });

  test('search with special characters should not crash @regression', async ({ homePage }) => {
    await homePage.navigate();
    const specialInputs = TestDataFactory.specialChars();
    await homePage.navbar.search(specialInputs);
    // Page should remain functional
    await expect(homePage.page.locator('body')).toBeVisible();
  });
});
