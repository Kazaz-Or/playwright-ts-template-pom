import { test, expect } from '../fixtures/base.fixture';

test.describe('Homepage', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should load with correct title @sanity', async ({ assertions }) => {
    await assertions.assertTitleContains('kazi');
  });

  test('should display navbar @sanity', async ({ homePage, assertions }) => {
    await assertions.assertVisible(homePage.navbar.root);
  });

  test('should display footer @sanity', async ({ homePage, assertions }) => {
    await assertions.assertVisible(homePage.footer.root);
  });

  test('should display hero heading @sanity', async ({ homePage }) => {
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroTitle).toContainText('Kazi');
  });

  test('should display blog cards @sanity', async ({ homePage, assertions }) => {
    await assertions.assertCountAtLeast(homePage.blogCards, 1);
  });

  test('should have Explore Articles link @regression', async ({ homePage }) => {
    await expect(homePage.exploreArticlesLink).toBeVisible();
  });

  test('should have Browse Categories link @regression', async ({ homePage }) => {
    await expect(homePage.browseCategoriesLink).toBeVisible();
  });

  test('navbar links should navigate correctly @regression', async ({ homePage }) => {
    await homePage.navbar.navigateToBlogs();
    await expect(homePage.page).toHaveURL(/\/blogs/);
    await homePage.page.goto('/');
    await homePage.navbar.navigateToAbout();
    await expect(homePage.page).toHaveURL(/\/about/);
  });

  test('blog cards should have valid links @regression', async ({ homePage }) => {
    const cards = homePage.blogCards;
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const firstLink = cards.first().getByRole('link').first();
    await expect(firstLink).toHaveAttribute('href', /.+/);
  });

  test('clicking Explore Articles should navigate to blogs @regression', async ({ homePage }) => {
    await homePage.clickExploreArticles();
    await expect(homePage.page).toHaveURL(/\/blogs/);
  });

  test('should not have broken images @regression', async ({ assertions }) => {
    await assertions.assertNoImageErrors();
  });
});
