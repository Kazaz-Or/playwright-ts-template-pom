import { Locator, Page } from '@playwright/test';
import { IComponent } from './types';

/**
 * Search component — inline search in the navbar on kazis.dev.
 * The search input is always visible in the nav bar (not a modal).
 */
export class SearchComponent implements IComponent {
  readonly root: Locator;
  readonly searchInput: Locator;
  readonly resultItems: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('navigation', { name: 'Global' });
    this.searchInput = this.root.getByRole('textbox', { name: /search/i });
    // ponytail: result selector is generic — update when test-ids added
    this.resultItems = page.locator('a[href*="/blogs/"]');
  }

  async isVisible(): Promise<boolean> {
    return this.searchInput.isVisible();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async getResultCount(): Promise<number> {
    return this.resultItems.count();
  }

  async clickFirstResult(): Promise<void> {
    await this.resultItems.first().click();
  }
}
