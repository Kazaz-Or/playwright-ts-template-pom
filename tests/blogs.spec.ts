import { test, expect } from '../fixtures/base.fixture';

test.describe('Blogs Page', () => {
  test.beforeEach(async ({ blogsPage }) => {
    await blogsPage.navigate();
  });

  test('should load with correct URL @sanity', async ({ assertions }) => {
    await assertions.assertUrlContains(/\/blogs/);
  });

  test('should display blog listing @sanity', async ({ blogsPage, assertions }) => {
    await assertions.assertCountAtLeast(blogsPage.blogCards, 1);
  });

  test('should display page heading @sanity', async ({ blogsPage }) => {
    await expect(blogsPage.pageTitle).toBeVisible();
    await expect(blogsPage.pageTitle).toContainText(/blog/i);
  });

  test('should display navbar and footer @regression', async ({ blogsPage, assertions }) => {
    await assertions.assertVisible(blogsPage.navbar.root);
    await assertions.assertVisible(blogsPage.footer.root);
  });

  test('all blog cards should have titles @regression', async ({ blogsPage }) => {
    const titles = await blogsPage.getAllBlogTitles();
    expect(titles.length).toBeGreaterThan(0);
    titles.forEach((title) => {
      expect(title.trim()).toBeTruthy();
    });
  });

  test('clicking a blog post should navigate to it @regression', async ({ blogsPage }) => {
    await blogsPage.clickBlogByIndex(0);
    await blogsPage.page.waitForURL(/\/blogs\/.+/);
    expect(blogsPage.page.url()).toMatch(/\/blogs\/.+/);
  });

  test('should have more than 5 blog posts @regression', async ({ blogsPage }) => {
    const count = await blogsPage.getBlogCount();
    expect(count).toBeGreaterThan(5);
  });
});
