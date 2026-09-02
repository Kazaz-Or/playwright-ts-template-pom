import { test, expect } from '../fixtures/base.fixture';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should have theme toggle button @sanity', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    await expect(toggle).toBeVisible();
  });

  test('should toggle between dark and light mode @regression', async ({ page }) => {
    const htmlEl = page.locator('html');
    const initialClass = await htmlEl.getAttribute('class');
    const wasDark = initialClass?.includes('dark');

    // Click toggle
    const toggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    await toggle.click();

    // Class should change
    if (wasDark) {
      await expect(htmlEl).not.toHaveClass(/dark/);
    } else {
      await expect(htmlEl).toHaveClass(/dark/);
    }
  });

  test('should toggle back to original mode @regression', async ({ page }) => {
    const htmlEl = page.locator('html');
    const initialClass = await htmlEl.getAttribute('class');

    const toggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    await toggle.click();
    await toggle.click();

    // Should return to initial state
    const finalClass = await htmlEl.getAttribute('class');
    const initialDark = initialClass?.includes('dark') ?? false;
    const finalDark = finalClass?.includes('dark') ?? false;
    expect(finalDark).toBe(initialDark);
  });

  test('toggle button should have accessible label @regression', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    const ariaLabel = await toggle.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/switch to (light|dark) mode/i);
  });
});
