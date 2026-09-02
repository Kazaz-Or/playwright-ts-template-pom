import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Routes } from '../constants/routes.enum';

export class BlogsPage extends BasePage {
  protected readonly path = Routes.Blogs;

  readonly pageTitle: Locator;
  readonly blogCards: Locator;

  constructor(page: Page) {
    super(page);
    // ponytail: blogs page uses h2, not h1 for the main heading
    this.pageTitle = page.getByRole('heading', { name: /blog/i }).first();
    this.blogCards = page.locator('article');
  }

  async getBlogCount(): Promise<number> {
    return this.blogCards.count();
  }

  async clickBlogByTitle(title: string): Promise<void> {
    await this.page.getByRole('link', { name: title }).first().click();
  }

  async clickBlogByIndex(index: number): Promise<void> {
    await this.blogCards.nth(index).getByRole('link').first().click();
  }

  async getAllBlogTitles(): Promise<string[]> {
    const headings = await this.blogCards.locator('h2, h3').all();
    return Promise.all(headings.map((h) => h.innerText()));
  }
}
