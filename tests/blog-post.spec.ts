import { test, expect } from '../fixtures/base.fixture';
import { blogTestData, featuredBlogSlug, nonExistentBlogSlug } from '../data/blog.data';

test.describe('Blog Post Page', () => {
  test('should load a blog post and display title @sanity', async ({ blogPostPage }) => {
    blogPostPage.setSlug(featuredBlogSlug);
    await blogPostPage.navigate();
    await expect(blogPostPage.postTitle).toBeVisible();
    const title = await blogPostPage.getPostTitle();
    expect(title.trim()).toBeTruthy();
  });

  test('should display post content @sanity', async ({ blogPostPage }) => {
    blogPostPage.setSlug(featuredBlogSlug);
    await blogPostPage.navigate();
    await expect(blogPostPage.postContent).toBeVisible();
  });

  test('should display post date @regression', async ({ blogPostPage }) => {
    blogPostPage.setSlug(featuredBlogSlug);
    await blogPostPage.navigate();
    await expect(blogPostPage.postDate).toBeVisible();
    const dateText = await blogPostPage.getPostDateText();
    expect(dateText.trim()).toBeTruthy();
  });

  test('should display tags on blog post @regression', async ({ blogPostPage }) => {
    blogPostPage.setSlug(featuredBlogSlug);
    await blogPostPage.navigate();
    const tags = await blogPostPage.getTagList();
    expect(tags.length).toBeGreaterThan(0);
  });

  test('should have code blocks on technical post @regression', async ({ blogPostPage }) => {
    blogPostPage.setSlug(featuredBlogSlug);
    await blogPostPage.navigate();
    const codeBlockCount = await blogPostPage.getCodeBlockCount();
    expect(codeBlockCount).toBeGreaterThan(0);
  });

  test('non-existent blog post should return 404 @regression', async ({ page }) => {
    const response = await page.goto(`/blogs/${nonExistentBlogSlug}`);
    const url = page.url();
    const status = response?.status();
    const is404 =
      status === 404 ||
      url.includes('404') ||
      (await page.title()).toLowerCase().includes('404') ||
      (await page.title()).toLowerCase().includes('not found');
    expect(is404, 'Non-existent blog should show 404').toBeTruthy();
  });

  test('should display navbar and footer @regression', async ({ blogPostPage, assertions }) => {
    blogPostPage.setSlug(featuredBlogSlug);
    await blogPostPage.navigate();
    await assertions.assertVisible(blogPostPage.navbar.root);
    await assertions.assertVisible(blogPostPage.footer.root);
  });

  for (const blogData of blogTestData.slice(0, 2)) {
    test(`should load blog post: ${blogData.slug} @regression`, async ({
      blogPostPage,
      assertions,
    }) => {
      blogPostPage.setSlug(blogData.slug);
      await blogPostPage.navigate();
      await assertions.assertVisible(blogPostPage.postTitle);
      await assertions.assertVisible(blogPostPage.postContent);
    });
  }
});
