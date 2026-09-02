import { Page, expect } from '@playwright/test';

/**
 * Page-level helper — common page operations reused across tests.
 */
export class PageHelper {
  constructor(private readonly page: Page) {}

  /** Wait for network to settle (no pending requests for 500ms) */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Get current page response status via a navigation */
  async getResponseStatus(url: string): Promise<number> {
    const response = await this.page.goto(url);
    return response?.status() ?? 0;
  }

  /** Assert page does not have JavaScript errors in console */
  async collectConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    return errors;
  }

  /** Take a named screenshot for visual comparison */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  /** Assert page responds within timeout */
  async assertPageLoadsWithin(url: string, maxMs: number): Promise<void> {
    const start = Date.now();
    await this.page.goto(url);
    const duration = Date.now() - start;
    expect(duration, `Page ${url} took ${duration}ms (max ${maxMs}ms)`).toBeLessThan(maxMs);
  }
}
