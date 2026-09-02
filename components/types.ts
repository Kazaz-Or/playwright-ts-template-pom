import { Locator, Page } from '@playwright/test';

export interface IComponent {
  readonly root: Locator;
  isVisible(): Promise<boolean>;
}

export type ComponentConstructor<T extends IComponent> = new (page: Page) => T;
