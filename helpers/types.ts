import { Page, Locator } from '@playwright/test';

export interface AssertionOptions {
  timeout?: number;
  message?: string;
}

export interface MetaTagInfo {
  name?: string;
  property?: string;
  content: string;
}

export interface NavigationStep {
  page: Page;
  locator: Locator;
  expectedUrl: string | RegExp;
}

// ─── Performance ────────────────────────────────────────────

export interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  domContentLoaded: number;
  loadComplete: number;
  domInteractive: number;
  resourceCount: number;
  transferSize: number;
}

export interface PerformanceBudget {
  /** Time to First Byte (ms) */
  ttfb?: number;
  /** First Contentful Paint (ms) */
  fcp?: number;
  /** DOMContentLoaded (ms) */
  domContentLoaded?: number;
  /** Full page load (ms) */
  loadComplete?: number;
  /** Max number of resource requests */
  maxResourceCount?: number;
  /** Max total transfer size in bytes */
  maxTransferSize?: number;
}

// ─── Accessibility ──────────────────────────────────────────

export interface A11yOptions {
  /** axe-core rule tags to include, e.g. ['wcag2aa', 'wcag21aa'] */
  tags?: string[];
  /** Rule IDs to disable */
  disableRules?: string[];
  /** CSS selector to scope scan to */
  includeSelector?: string;
  /** CSS selector to exclude from scan */
  excludeSelector?: string;
}

export interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  helpUrl: string;
  nodes: number;
  targets: string[];
}
