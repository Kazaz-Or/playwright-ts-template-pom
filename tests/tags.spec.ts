import { test, expect } from '../fixtures/base.fixture';
import { Tags } from '../constants/tags.enum';

test.describe('Tags Page', () => {
  test.beforeEach(async ({ tagsPage }) => {
    await tagsPage.navigate();
  });

  test('should load tags page @sanity', async ({ assertions }) => {
    await assertions.assertUrlContains(/\/tags/);
  });

  test('should display tag links @sanity', async ({ tagsPage, assertions }) => {
    await assertions.assertCountAtLeast(tagsPage.tagLinks, 1);
  });

  test('should display page heading @regression', async ({ tagsPage }) => {
    await expect(tagsPage.pageTitle).toBeVisible();
  });

  test('all tag links should have valid hrefs @regression', async ({ tagsPage, assertions }) => {
    await assertions.assertValidLinks(tagsPage.tagLinks);
  });

  test('clicking a tag should navigate to tag page @regression', async ({ tagsPage }) => {
    await tagsPage.clickTagByIndex(0);
    await tagsPage.page.waitForURL(/\/tags\/.+/);
    expect(tagsPage.page.url()).toMatch(/\/tags\/.+/);
  });

  test('should have Python tag @regression', async ({ tagsPage }) => {
    const allTags = await tagsPage.getAllTagNames();
    const tagTexts = allTags.map((t) => t.toLowerCase());
    const hasPython = tagTexts.some((t) => t.includes('python'));
    expect(hasPython, 'Tags page should include Python tag').toBeTruthy();
  });
});

test.describe('Tag Filter Page', () => {
  test('should display blogs for Playwright tag @sanity', async ({ tagPage }) => {
    tagPage.setTag(Tags.Playwright);
    await tagPage.navigate();
    const count = await tagPage.getBlogCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display blogs for Python tag @regression', async ({ tagPage }) => {
    tagPage.setTag(Tags.Python);
    await tagPage.navigate();
    const count = await tagPage.getBlogCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display page heading with tag name @regression', async ({ tagPage }) => {
    tagPage.setTag(Tags.Testing);
    await tagPage.navigate();
    await expect(tagPage.pageTitle).toBeVisible();
  });
});
