import { Page, expect } from '@playwright/test';
import { Routes } from '../constants/routes.enum';

/**
 * Navigation helper — common navigation patterns reused across tests.
 */
export class NavigationHelper {
  constructor(private readonly page: Page) {}

  async goTo(route: Routes | string): Promise<void> {
    await this.page.goto(route);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertLinkNavigation(linkText: string, expectedUrl: string | RegExp): Promise<void> {
    await this.page.getByRole('link', { name: linkText }).click();
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async waitForNavigation(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  async getCurrentPath(): Promise<string> {
    return new URL(this.page.url()).pathname;
  }
}
