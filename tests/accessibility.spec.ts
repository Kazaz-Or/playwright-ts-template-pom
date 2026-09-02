import { test, expect } from '../fixtures/base.fixture';
import { Routes } from '../constants/routes.enum';

test.describe('Accessibility Basics', () => {
  test('homepage should have lang attribute on html @sanity', async ({ page }) => {
    await page.goto(Routes.Home);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang, 'HTML should have lang attribute').toBeTruthy();
  });

  test('all images should have alt text @regression', async ({ page }) => {
    await page.goto(Routes.Home);
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      // Next.js placeholder images may have empty alt intentionally
      expect(alt !== null, `Image ${src} missing alt attribute`).toBeTruthy();
    }
  });

  test('navigation should be keyboard accessible @regression', async ({ page }) => {
    await page.goto(Routes.Home);
    // Tab to first link and verify focus
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag);
  });

  test('links should have discernible text @regression', async ({ page }) => {
    await page.goto(Routes.Home);
    const links = await page.getByRole('link').all();
    for (const link of links.slice(0, 20)) {
      // ponytail: check first 20 links, full audit if a11y lib added
      const text = await link.innerText().catch(() => '');
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      const img = await link.locator('img').count();
      const hasDiscernibleText =
        text.trim().length > 0 ||
        (ariaLabel && ariaLabel.length > 0) ||
        (title && title.length > 0) ||
        img > 0;
      expect(hasDiscernibleText, `Link should have discernible text`).toBeTruthy();
    }
  });

  test('headings should follow hierarchy @regression', async ({ page }) => {
    await page.goto(Routes.Home);
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    // First heading should be h1
    const firstTag = await headings[0].evaluate((el) => el.tagName);
    expect(firstTag).toBe('H1');
  });
});
