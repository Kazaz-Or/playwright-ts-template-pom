import { test, expect } from '../fixtures/base.fixture';

test.describe('API & Resource Tests', () => {
  test('all main pages should return 200 @sanity', async ({ blogApi }) => {
    const pages = ['/', '/blogs', '/about', '/tags'];
    for (const path of pages) {
      const exists = await blogApi.checkPageExists(path);
      expect(exists, `${path} should be accessible`).toBeTruthy();
    }
  });

  test('non-existent page should return 404 @regression', async ({ blogApi }) => {
    const status = await blogApi.getPageStatus('/this-does-not-exist-xyz');
    expect(status).toBe(404);
  });

  test('known blog post should be accessible via API @regression', async ({ blogApi }) => {
    const exists = await blogApi.checkPageExists('/blogs/playwright-sounds-test');
    expect(exists).toBeTruthy();
  });

  test('RSS feed should return valid XML @regression', async ({ blogApi }) => {
    const response = await blogApi.getRssFeed();
    expect(response.ok).toBeTruthy();
    expect(response.data).toContain('<rss');
    expect(response.data).toContain('<item>');
  });

  test('pages should return proper cache headers @regression', async ({ blogApi }) => {
    const headers = await blogApi.getResponseHeaders('/');
    expect(headers['content-type']).toContain('text/html');
  });
});
