import { test, expect } from '../fixtures/base.fixture';
import { searchQueries } from '../data/search.data';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('search input should be visible in navbar @sanity', async ({ homePage }) => {
    await expect(homePage.navbar.searchInput).toBeVisible();
  });

  test('should accept search input @sanity', async ({ homePage }) => {
    await homePage.navbar.search(searchQueries.validQuery);
    await expect(homePage.navbar.searchInput).toHaveValue(searchQueries.validQuery);
  });

  test('should return results for valid query @regression', async ({ homePage }) => {
    await homePage.navbar.search(searchQueries.validQuery);
    // After searching, results should appear as links to blog posts
    const results = homePage.page.locator('a[href*="/blogs/"]');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty search gracefully @regression', async ({ homePage }) => {
    await homePage.navbar.search(searchQueries.emptyQuery);
    // Should not crash — page should remain stable
    await expect(homePage.page.locator('body')).toBeVisible();
  });

  test('search should clear when emptied @regression', async ({ homePage }) => {
    await homePage.navbar.search(searchQueries.validQuery);
    await homePage.navbar.clearSearch();
    await expect(homePage.navbar.searchInput).toHaveValue('');
  });
});
