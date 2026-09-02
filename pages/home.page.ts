import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Routes } from '../constants/routes.enum';

export class HomePage extends BasePage {
  protected readonly path = Routes.Home;

  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly exploreArticlesLink: Locator;
  readonly browseCategoriesLink: Locator;
  readonly blogCards: Locator;
  readonly latestArticlesHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.getByRole('heading', { level: 1 });
    this.heroSubtitle = page.locator('main p').first();
    this.exploreArticlesLink = page.getByRole('link', { name: 'Explore Articles' });
    this.browseCategoriesLink = page.getByRole('link', { name: 'Browse Categories' });
    this.blogCards = page.locator('article');
    this.latestArticlesHeading = page.getByRole('heading', { name: /latest articles/i });
  }

  async getBlogCardCount(): Promise<number> {
    return this.blogCards.count();
  }

  async clickBlogCard(index: number): Promise<void> {
    await this.blogCards.nth(index).getByRole('link').first().click();
  }

  async getBlogCardTitles(): Promise<string[]> {
    const headings = await this.blogCards.locator('h2, h3').all();
    return Promise.all(headings.map((h) => h.innerText()));
  }

  async clickExploreArticles(): Promise<void> {
    await this.exploreArticlesLink.click();
    await this.page.waitForURL('**/blogs');
  }
}
