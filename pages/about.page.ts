import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Routes } from '../constants/routes.enum';

export class AboutPage extends BasePage {
  protected readonly path = Routes.About;

  readonly pageTitle: Locator;
  readonly pageContent: Locator;
  readonly profileImage: Locator;
  readonly socialLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.pageContent = page.locator('article').first();
    this.profileImage = page.getByRole('img', { name: /Or Kazaz/i });
    this.socialLinks = page.getByRole('link', { name: /linkedin|github|twitter/i });
  }

  async getPageHeading(): Promise<string> {
    return this.pageTitle.innerText();
  }

  async getSocialLinkCount(): Promise<number> {
    return this.socialLinks.count();
  }

  async getSocialLinkUrls(): Promise<string[]> {
    const links = await this.socialLinks.all();
    return Promise.all(links.map((link) => link.getAttribute('href').then((href) => href ?? '')));
  }
}
