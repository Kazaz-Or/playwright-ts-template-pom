import { Page, expect } from '@playwright/test';
import { PerformanceBudget, PerformanceMetrics } from './types';
import logger from '../utils/logger';

/**
 * Performance helper — measures Web Vitals and asserts against budgets.
 *
 * Uses the browser's PerformanceObserver and Navigation Timing API.
 */
export class PerformanceHelper {
  constructor(private readonly page: Page) {}

  /** Collect core Web Vitals from the current page */
  async getMetrics(): Promise<PerformanceMetrics> {
    return this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((e) => e.name === 'first-contentful-paint');

      return {
        ttfb: nav ? nav.responseStart - nav.requestStart : 0,
        fcp: fcp ? fcp.startTime : 0,
        domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
        loadComplete: nav ? nav.loadEventEnd - nav.startTime : 0,
        domInteractive: nav ? nav.domInteractive - nav.startTime : 0,
        resourceCount: performance.getEntriesByType('resource').length,
        transferSize: (
          performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        ).reduce((sum, r) => sum + (r.transferSize || 0), 0),
      };
    });
  }

  /** Measure LCP — requires navigating first, then waiting for paint */
  async getLCP(): Promise<number> {
    return this.page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcp = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          lcp = last.startTime;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        // Resolve after a short wait to capture buffered entries
        setTimeout(() => {
          observer.disconnect();
          resolve(lcp);
        }, 1000);
      });
    });
  }

  /** Measure CLS — cumulative layout shift */
  async getCLS(): Promise<number> {
    return this.page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 2000);
      });
    });
  }

  /** Assert all metrics against a performance budget */
  async assertBudget(budget: PerformanceBudget): Promise<PerformanceMetrics> {
    const metrics = await this.getMetrics();

    if (budget.ttfb !== undefined) {
      expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms exceeds budget ${budget.ttfb}ms`).toBeLessThan(
        budget.ttfb,
      );
    }
    if (budget.fcp !== undefined) {
      expect(metrics.fcp, `FCP ${metrics.fcp}ms exceeds budget ${budget.fcp}ms`).toBeLessThan(
        budget.fcp,
      );
    }
    if (budget.domContentLoaded !== undefined) {
      expect(
        metrics.domContentLoaded,
        `DCL ${metrics.domContentLoaded}ms exceeds budget ${budget.domContentLoaded}ms`,
      ).toBeLessThan(budget.domContentLoaded);
    }
    if (budget.loadComplete !== undefined) {
      expect(
        metrics.loadComplete,
        `Load ${metrics.loadComplete}ms exceeds budget ${budget.loadComplete}ms`,
      ).toBeLessThan(budget.loadComplete);
    }
    if (budget.maxResourceCount !== undefined) {
      expect(
        metrics.resourceCount,
        `${metrics.resourceCount} resources exceeds budget ${budget.maxResourceCount}`,
      ).toBeLessThan(budget.maxResourceCount);
    }
    if (budget.maxTransferSize !== undefined) {
      expect(
        metrics.transferSize,
        `Transfer size ${(metrics.transferSize / 1024).toFixed(0)}KB exceeds budget ${(budget.maxTransferSize / 1024).toFixed(0)}KB`,
      ).toBeLessThan(budget.maxTransferSize);
    }

    return metrics;
  }

  /** Print metrics to console (useful for debugging) */
  printMetrics(metrics: PerformanceMetrics): void {
    logger.info(`TTFB: ${metrics.ttfb.toFixed(0)}ms`);
    logger.info(`FCP: ${metrics.fcp.toFixed(0)}ms`);
    logger.info(`DOM Interactive: ${metrics.domInteractive.toFixed(0)}ms`);
    logger.info(`DCL: ${metrics.domContentLoaded.toFixed(0)}ms`);
    logger.info(`Load Complete: ${metrics.loadComplete.toFixed(0)}ms`);
    logger.info(`Resources: ${metrics.resourceCount}`);
    logger.info(`Transfer Size: ${(metrics.transferSize / 1024).toFixed(0)}KB`);
  }
}
