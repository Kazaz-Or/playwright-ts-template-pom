import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { tagRoute } from '../constants/routes.enum';

export class TagPage extends BasePage {
  protected path: string;

  readonly pageTitle: Locator;
  readonly blogCards: Locator;

  constructor(page: Page, tag?: string) {
    super(page);
    this.path = tag ? tagRoute(tag) : '/tags';
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.blogCards = page.locator('article');
  }

  setTag(tag: string): void {
    this.path = tagRoute(tag);
  }

  async getBlogCount(): Promise<number> {
    return this.blogCards.count();
  }

  async getBlogTitles(): Promise<string[]> {
    const headings = await this.blogCards.locator('h2, h3').all();
    return Promise.all(headings.map((h) => h.innerText()));
  }

  async clickBlogByIndex(index: number): Promise<void> {
    await this.blogCards.nth(index).getByRole('link').first().click();
  }
}
