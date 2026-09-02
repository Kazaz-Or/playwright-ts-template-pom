import { Locator, Page } from '@playwright/test';
import { IComponent } from './types';

export class FooterComponent implements IComponent {
  readonly root: Locator;
  readonly githubLink: Locator;
  readonly linkedinLink: Locator;
  readonly twitterLink: Locator;
  readonly copyrightText: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('footer');
    this.githubLink = this.root.locator('a[href*="github"]');
    this.linkedinLink = this.root.locator('a[href*="linkedin"]');
    this.twitterLink = this.root.locator('a[href*="twitter"], a[href*="x.com"]');
    this.copyrightText = this.root.getByText(/©/i).first();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async getSocialLinks(): Promise<string[]> {
    const links = await this.root.locator('a[href^="http"]').all();
    return Promise.all(links.map((link) => link.getAttribute('href').then((href) => href ?? '')));
  }

  async getCopyrightText(): Promise<string> {
    return this.copyrightText.innerText();
  }
}
