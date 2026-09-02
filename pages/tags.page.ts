import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Routes } from '../constants/routes.enum';

export class TagsPage extends BasePage {
  protected readonly path = Routes.Tags;

  readonly pageTitle: Locator;
  readonly tagLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.tagLinks = page.locator('a[href*="/tags/"]');
  }

  async getTagCount(): Promise<number> {
    return this.tagLinks.count();
  }

  async getAllTagNames(): Promise<string[]> {
    const links = await this.tagLinks.all();
    return Promise.all(links.map((link) => link.innerText()));
  }

  async clickTag(tagName: string): Promise<void> {
    await this.page.getByRole('link', { name: tagName }).first().click();
  }

  async clickTagByIndex(index: number): Promise<void> {
    await this.tagLinks.nth(index).click();
  }
}
