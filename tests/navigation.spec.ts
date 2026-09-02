import { test, expect } from '../fixtures/base.fixture';
import { Routes } from '../constants/routes.enum';

test.describe('Navigation', () => {
  test('should navigate from home to blogs via navbar @sanity', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.navbar.navigateToBlogs();
    await expect(homePage.page).toHaveURL(/\/blogs/);
  });

  test('should navigate from home to about via navbar @sanity', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.navbar.navigateToAbout();
    await expect(homePage.page).toHaveURL(/\/about/);
  });

  test('clicking site logo should navigate to home @regression', async ({ page }) => {
    await page.goto(Routes.Blogs);
    const homeLink = page
      .getByRole('navigation', { name: 'Global' })
      .getByRole('link', { name: /kazi/i })
      .first();
    await homeLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('browser back button should work @regression', async ({ homePage, navigation }) => {
    await homePage.navigate();
    await homePage.navbar.navigateToBlogs();
    await expect(homePage.page).toHaveURL(/\/blogs/);
    await navigation.goBack();
    await expect(homePage.page).toHaveURL(/\/$/);
  });

  test('all main routes should be accessible @regression', async ({ page }) => {
    const routes = [
      { path: Routes.Home, pattern: /\/$|\// },
      { path: Routes.Blogs, pattern: /\/blogs/ },
      { path: Routes.About, pattern: /\/about/ },
      { path: Routes.Tags, pattern: /\/tags/ },
    ];

    for (const { path } of routes) {
      const response = await page.goto(path);
      expect(response?.status(), `Route ${path} should return 200`).toBeLessThan(400);
    }
  });

  test('404 page should be displayed for invalid route @regression', async ({ page }) => {
    const response = await page.goto('/this-page-definitely-does-not-exist-xyz');
    const url = page.url();
    const status = response?.status();
    const pageText = await page.textContent('body');
    const is404 =
      status === 404 ||
      url.includes('404') ||
      (pageText?.toLowerCase().includes('not found') ?? false) ||
      (pageText?.toLowerCase().includes("doesn't exist") ?? false);
    expect(is404, '404 page should be shown for invalid route').toBeTruthy();
  });
});
