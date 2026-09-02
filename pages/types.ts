import { Page } from '@playwright/test';

export interface IPage {
  readonly page: Page;
  navigate(): Promise<void>;
  waitForLoad(): Promise<void>;
  getTitle(): Promise<string>;
  getUrl(): string;
}
