import { expect, Locator, Page } from '@playwright/test';
import { AssertionOptions, MetaTagInfo } from './types';

/**
 * Reusable assertion helpers for kazis.dev tests.
 * These wrap Playwright expect() with domain-specific logic.
 */
export class AssertionsHelper {
  constructor(private readonly page: Page) {}

  /** Assert page title contains the expected string */
  async assertTitleContains(text: string, options?: AssertionOptions): Promise<void> {
    await expect(this.page, options?.message).toHaveTitle(new RegExp(text, 'i'), {
      timeout: options?.timeout,
    });
  }

  /** Assert URL matches the expected pattern */
  async assertUrlContains(pattern: string | RegExp, options?: AssertionOptions): Promise<void> {
    await expect(this.page, options?.message).toHaveURL(pattern, { timeout: options?.timeout });
  }

  /** Assert element is visible */
  async assertVisible(locator: Locator, options?: AssertionOptions): Promise<void> {
    await expect(locator, options?.message).toBeVisible({ timeout: options?.timeout });
  }

  /** Assert element is hidden */
  async assertHidden(locator: Locator, options?: AssertionOptions): Promise<void> {
    await expect(locator, options?.message).toBeHidden({ timeout: options?.timeout });
  }

  /** Assert element text contains the expected string */
  async assertTextContains(
    locator: Locator,
    text: string,
    options?: AssertionOptions,
  ): Promise<void> {
    await expect(locator, options?.message).toContainText(text, { timeout: options?.timeout });
  }

  /** Assert element count is at least the minimum */
  async assertCountAtLeast(
    locator: Locator,
    min: number,
    options?: AssertionOptions,
  ): Promise<void> {
    const count = await locator.count();
    expect(
      count,
      options?.message ?? `Expected at least ${min} elements, got ${count}`,
    ).toBeGreaterThanOrEqual(min);
  }

  /** Assert element count equals the expected number */
  async assertCount(locator: Locator, expected: number, options?: AssertionOptions): Promise<void> {
    await expect(locator, options?.message).toHaveCount(expected, { timeout: options?.timeout });
  }

  /** Assert a meta tag has the expected content */
  async assertMetaTag(info: MetaTagInfo): Promise<void> {
    const selector = info.name ? `meta[name="${info.name}"]` : `meta[property="${info.property}"]`;
    const meta = this.page.locator(selector);
    await expect(meta).toHaveAttribute('content', new RegExp(info.content, 'i'));
  }

  /** Assert page has canonical link tag */
  async assertCanonicalUrl(url: string): Promise<void> {
    const canonical = this.page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', url);
  }

  /** Assert no broken images on the page */
  async assertNoImageErrors(): Promise<void> {
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      const src = await img.getAttribute('src');
      expect(naturalWidth, `Image failed to load: ${src}`).toBeGreaterThan(0);
    }
  }

  /** Assert page has no console errors */
  async assertNoConsoleErrors(): Promise<void> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors, `Console errors found: ${errors.join(', ')}`).toHaveLength(0);
  }

  /** Assert that an anchor link is valid (href attribute is set) */
  async assertValidLinks(locator: Locator): Promise<void> {
    const links = await locator.all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      expect(href, 'Link has no href attribute').toBeTruthy();
    }
  }

  /** Assert page contains at least one heading */
  async assertHasHeadings(): Promise<void> {
    const headings = this.page.getByRole('heading');
    await this.assertCountAtLeast(headings, 1);
  }

  /** Assert page has proper OG meta tags (at least one of each) */
  async assertOpenGraphTags(): Promise<void> {
    const ogTitle = this.page.locator('meta[property="og:title"]');
    const ogDescription = this.page.locator('meta[property="og:description"]');
    await this.assertCountAtLeast(ogTitle, 1, { message: 'Should have og:title meta tag' });
    await this.assertCountAtLeast(ogDescription, 1, {
      message: 'Should have og:description meta tag',
    });
  }
}
