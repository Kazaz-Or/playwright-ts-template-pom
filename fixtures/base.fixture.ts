import { test as base } from '@playwright/test';
import { BlogApi } from '../api/blog.api';
import { AccessibilityHelper } from '../helpers/accessibility.helper';
import { AssertionsHelper } from '../helpers/assertions.helper';
import { NavigationHelper } from '../helpers/navigation.helper';
import { PageHelper } from '../helpers/page.helper';
import { PerformanceHelper } from '../helpers/performance.helper';
import { AboutPage } from '../pages/about.page';
import { BlogPostPage } from '../pages/blog-post.page';
import { BlogsPage } from '../pages/blogs.page';
import { HomePage } from '../pages/home.page';
import { TagPage } from '../pages/tag.page';
import { TagsPage } from '../pages/tags.page';
import { TestFixtures } from './types';

/**
 * Extended Playwright test fixture that provides all page objects and helpers.
 * Import `test` and `expect` from this file instead of '@playwright/test'.
 */
export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  blogsPage: async ({ page }, use) => {
    await use(new BlogsPage(page));
  },

  blogPostPage: async ({ page }, use) => {
    await use(new BlogPostPage(page));
  },

  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page));
  },

  tagsPage: async ({ page }, use) => {
    await use(new TagsPage(page));
  },

  tagPage: async ({ page }, use) => {
    await use(new TagPage(page));
  },

  assertions: async ({ page }, use) => {
    await use(new AssertionsHelper(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationHelper(page));
  },

  pageHelper: async ({ page }, use) => {
    await use(new PageHelper(page));
  },

  performance: async ({ page }, use) => {
    await use(new PerformanceHelper(page));
  },

  a11y: async ({ page }, use) => {
    await use(new AccessibilityHelper(page));
  },

  blogApi: async ({}, use) => {
    await use(new BlogApi());
  },
});

export { expect } from '@playwright/test';
