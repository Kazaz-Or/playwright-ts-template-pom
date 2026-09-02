import { test, expect } from '../fixtures/base.fixture';
import { Routes } from '../constants/routes.enum';
import { PerformanceBudgets } from '../constants/performance.constants';

test.describe('Performance Budgets', () => {
  test('homepage should meet performance budget @regression', async ({ page, performance }) => {
    await page.goto(Routes.Home);
    await page.waitForLoadState('load');
    const metrics = await performance.assertBudget(PerformanceBudgets.static);
    performance.printMetrics(metrics);
  });

  test('blogs page should meet performance budget @regression', async ({ page, performance }) => {
    await page.goto(Routes.Blogs);
    await page.waitForLoadState('load');
    const metrics = await performance.assertBudget(PerformanceBudgets.blogListing);
    performance.printMetrics(metrics);
  });

  test('blog post should meet performance budget @regression', async ({ page, performance }) => {
    await page.goto('/blogs/playwright-sounds-test');
    await page.waitForLoadState('load');
    const metrics = await performance.assertBudget(PerformanceBudgets.blogPost);
    performance.printMetrics(metrics);
  });

  test('about page should meet performance budget @regression', async ({ page, performance }) => {
    await page.goto(Routes.About);
    await page.waitForLoadState('load');
    const metrics = await performance.assertBudget(PerformanceBudgets.static);
    performance.printMetrics(metrics);
  });

  test('tags page should meet performance budget @regression', async ({ page, performance }) => {
    await page.goto(Routes.Tags);
    await page.waitForLoadState('load');
    const metrics = await performance.assertBudget(PerformanceBudgets.static);
    performance.printMetrics(metrics);
  });

  test('homepage LCP should be under 3 seconds @regression', async ({ page, performance }) => {
    await page.goto(Routes.Home);
    await page.waitForLoadState('load');
    const lcp = await performance.getLCP();
    expect(lcp, `LCP was ${lcp.toFixed(0)}ms`).toBeLessThan(3000);
  });

  test('homepage CLS should be under 0.1 @regression', async ({ page, performance }) => {
    await page.goto(Routes.Home);
    await page.waitForLoadState('load');
    const cls = await performance.getCLS();
    expect(cls, `CLS was ${cls.toFixed(3)}`).toBeLessThan(0.1);
  });
});
