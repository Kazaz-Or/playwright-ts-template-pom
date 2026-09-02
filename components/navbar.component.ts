import { Locator, Page } from '@playwright/test';
import { IComponent } from './types';

export class NavbarComponent implements IComponent {
  readonly root: Locator;
  readonly homeLink: Locator;
  readonly blogsLink: Locator;
  readonly aboutLink: Locator;
  readonly devDigestLink: Locator;
  readonly searchInput: Locator;
  readonly logoLink: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('navigation', { name: 'Global' });
    this.logoLink = this.root.getByRole('link', { name: /kazi/i }).first();
    this.homeLink = this.root.getByRole('link', { name: 'Home' });
    this.aboutLink = this.root.getByRole('link', { name: 'About' });
    this.blogsLink = this.root.getByRole('link', { name: 'Blogs' });
    this.devDigestLink = this.root.getByRole('link', { name: 'Dev.digest' });
    this.searchInput = this.root.getByRole('textbox', { name: /search/i });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async navigateToHome(): Promise<void> {
    await this.homeLink.click();
    await this.page.waitForURL('**/');
  }

  async navigateToBlogs(): Promise<void> {
    await this.blogsLink.click();
    await this.page.waitForURL('**/blogs');
  }

  async navigateToAbout(): Promise<void> {
    await this.aboutLink.click();
    await this.page.waitForURL('**/about');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // ponytail: debounce wait, increase if search latency grows
    await this.page.waitForTimeout(500);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }
}
