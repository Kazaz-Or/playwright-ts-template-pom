import { test, expect } from '../fixtures/base.fixture';

test.describe('RSS Feed', () => {
  test('should return valid RSS XML @sanity', async ({ blogApi }) => {
    const response = await blogApi.checkPageExists('/rss.xml');
    expect(response, 'RSS feed should be accessible').toBeTruthy();
  });

  test('should contain required RSS elements @regression', async ({ blogApi }) => {
    const response = await blogApi.getRssFeed();
    expect(response.ok).toBeTruthy();

    const xml = response.data;
    expect(xml).toContain('<rss');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<title>');
    expect(xml).toContain('<link>');
    expect(xml).toContain('<description>');
    expect(xml).toContain('<item>');
  });

  test('should have RSS link tag in page head @regression', async ({ page }) => {
    await page.goto('/');
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveCount(1);
    await expect(rssLink).toHaveAttribute('href', /rss/);
  });

  test('should have RSS link accessible from page @regression', async ({ page }) => {
    await page.goto('/');
    const rssAnchor = page.locator('a[href*="rss"]');
    await expect(rssAnchor.first()).toBeVisible();
  });
});
