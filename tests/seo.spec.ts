import { test } from '../fixtures/base.fixture';
import { Routes } from '../constants/routes.enum';

test.describe('SEO & Meta Tags', () => {
  test('homepage should have proper title @sanity', async ({ page, assertions }) => {
    await page.goto(Routes.Home);
    await assertions.assertTitleContains('kazi');
  });

  test('homepage should have OG meta tags @regression', async ({ page, assertions }) => {
    await page.goto(Routes.Home);
    await assertions.assertOpenGraphTags();
  });

  test('about page should have OG meta tags @regression', async ({ page, assertions }) => {
    await page.goto(Routes.About);
    await assertions.assertOpenGraphTags();
  });

  test('blog post should have OG meta tags @regression', async ({ page, assertions }) => {
    await page.goto('/blogs/playwright-sounds-test');
    await assertions.assertOpenGraphTags();
  });

  test('blog post should have description meta tag @regression', async ({ page, assertions }) => {
    await page.goto('/blogs/playwright-sounds-test');
    await assertions.assertMetaTag({ name: 'description', content: '.+' });
  });

  test('all pages should have at least one heading @regression', async ({ page, assertions }) => {
    const pages = [Routes.Home, Routes.Blogs, Routes.About, Routes.Tags];
    for (const route of pages) {
      await page.goto(route);
      await assertions.assertHasHeadings();
    }
  });

  test('images on homepage should load correctly @regression', async ({ page, assertions }) => {
    await page.goto(Routes.Home);
    await assertions.assertNoImageErrors();
  });

  test('images on about page should load correctly @regression', async ({ page, assertions }) => {
    await page.goto(Routes.About);
    await assertions.assertNoImageErrors();
  });
});
