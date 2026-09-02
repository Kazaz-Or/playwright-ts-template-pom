import { Page } from '@playwright/test';
import { NavbarComponent } from '../components/navbar.component';
import { FooterComponent } from '../components/footer.component';
import { IPage } from './types';

export abstract class BasePage implements IPage {
  readonly navbar: NavbarComponent;
  readonly footer: FooterComponent;
  protected abstract readonly path: string;

  constructor(readonly page: Page) {
    this.navbar = new NavbarComponent(page);
    this.footer = new FooterComponent(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  getUrl(): string {
    return this.page.url();
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}
