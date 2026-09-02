import { test, expect } from '../fixtures/base.fixture';

test.describe('About Page', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.navigate();
  });

  test('should load about page @sanity', async ({ aboutPage, assertions }) => {
    await assertions.assertUrlContains(/\/about/);
    await assertions.assertVisible(aboutPage.pageContent);
  });

  test('should have a main heading @sanity', async ({ aboutPage }) => {
    await expect(aboutPage.pageTitle).toBeVisible();
    const heading = await aboutPage.getPageHeading();
    expect(heading).toContain('Or Kazaz');
  });

  test('should display profile image @sanity', async ({ aboutPage }) => {
    await expect(aboutPage.profileImage).toBeVisible();
  });

  test('should display navbar and footer @regression', async ({ aboutPage, assertions }) => {
    await assertions.assertVisible(aboutPage.navbar.root);
    await assertions.assertVisible(aboutPage.footer.root);
  });

  test('should have social links @regression', async ({ aboutPage }) => {
    const count = await aboutPage.getSocialLinkCount();
    expect(count).toBeGreaterThan(0);
  });

  test('social links should be valid URLs @regression', async ({ aboutPage }) => {
    const urls = await aboutPage.getSocialLinkUrls();
    urls.forEach((url) => {
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  test('page title should contain relevant text @regression', async ({ assertions }) => {
    await assertions.assertTitleContains('kazaz|about');
  });
});
