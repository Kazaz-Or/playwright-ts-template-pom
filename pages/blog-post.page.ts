import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { blogRoute } from '../constants/routes.enum';

export class BlogPostPage extends BasePage {
  protected path: string;

  readonly postTitle: Locator;
  readonly postContent: Locator;
  readonly postDate: Locator;
  readonly postTags: Locator;
  readonly codeBlocks: Locator;
  readonly shareLinks: Locator;
  readonly authorSection: Locator;

  constructor(page: Page, slug?: string) {
    super(page);
    this.path = slug ? blogRoute(slug) : '/blogs';
    this.postTitle = page.getByRole('heading', { level: 1 });
    this.postContent = page.locator('article').first();
    this.postDate = page.locator('time').first();
    this.postTags = page.locator('a[href*="/tags/"]');
    this.codeBlocks = page.locator('pre code');
    this.shareLinks = page.locator(
      'a[href*="twitter.com/intent"], a[href*="linkedin.com/share"], a[href*="facebook.com/share"], a[href*="reddit.com"]',
    );
    this.authorSection = page.locator('img[alt*="Or Kazaz" i]').first();
  }

  setSlug(slug: string): void {
    this.path = blogRoute(slug);
  }

  async getPostTitle(): Promise<string> {
    return this.postTitle.innerText();
  }

  async getCodeBlockCount(): Promise<number> {
    return this.codeBlocks.count();
  }

  async getTagList(): Promise<string[]> {
    const tags = await this.postTags.all();
    return Promise.all(tags.map((tag) => tag.innerText()));
  }

  async getPostDateText(): Promise<string> {
    return this.postDate.innerText();
  }
}
