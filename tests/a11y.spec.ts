import { test } from '../fixtures/base.fixture';
import { Routes } from '../constants/routes.enum';

/**
 * Known a11y issues on kazis.dev (tracked, not blocking):
 * - color-contrast: Some text elements have insufficient contrast ratio
 * - svg-img-alt: Some SVGs missing accessible text
 *
 * These are excluded from strict assertions but logged in audit tests.
 * Remove from disableRules once fixed in the app.
 */
const KNOWN_ISSUES = ['color-contrast', 'svg-img-alt'];

test.describe('Accessibility Audit (axe-core)', () => {
  test('homepage should have no critical a11y violations @sanity', async ({ page, a11y }) => {
    await page.goto(Routes.Home);
    await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
  });

  test('blogs page should have no critical a11y violations @sanity', async ({ page, a11y }) => {
    await page.goto(Routes.Blogs);
    await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
  });

  test('about page should have no critical a11y violations @regression', async ({ page, a11y }) => {
    await page.goto(Routes.About);
    await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
  });

  test('tags page should have no critical a11y violations @regression', async ({ page, a11y }) => {
    await page.goto(Routes.Tags);
    await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
  });

  test('blog post should have no critical a11y violations @regression', async ({ page, a11y }) => {
    await page.goto('/blogs/playwright-sounds-test');
    await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
  });

  test('homepage full WCAG 2.1 AA audit (informational) @regression', async ({ page, a11y }) => {
    await page.goto(Routes.Home);
    const violations = await a11y.scan({ tags: ['wcag21aa', 'wcag2aa'] });
    a11y.printViolations(violations);
    // Informational — logs all violations including known issues
  });

  test('navigation should be accessible @regression', async ({ page, a11y }) => {
    await page.goto(Routes.Home);
    await a11y.assertNoCriticalViolations({
      includeSelector: 'nav',
      disableRules: KNOWN_ISSUES,
    });
  });

  test('footer should be accessible @regression', async ({ page, a11y }) => {
    await page.goto(Routes.Home);
    await a11y.assertNoCriticalViolations({
      includeSelector: 'footer',
      disableRules: KNOWN_ISSUES,
    });
  });
});
