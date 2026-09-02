import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { A11yOptions, A11yViolation } from './types';

/**
 * Accessibility helper — wraps axe-core for WCAG compliance scanning.
 *
 * Provides full axe audits and targeted checks for specific WCAG criteria.
 */
export class AccessibilityHelper {
  constructor(private readonly page: Page) {}

  /** Run full axe scan and return violations */
  async scan(options?: A11yOptions): Promise<A11yViolation[]> {
    let builder = new AxeBuilder({ page: this.page });

    if (options?.tags) {
      builder = builder.withTags(options.tags);
    }
    if (options?.disableRules) {
      builder = builder.disableRules(options.disableRules);
    }
    if (options?.includeSelector) {
      builder = builder.include(options.includeSelector);
    }
    if (options?.excludeSelector) {
      builder = builder.exclude(options.excludeSelector);
    }

    const results = await builder.analyze();

    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact as A11yViolation['impact'],
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(' > ')),
    }));
  }

  /** Assert zero violations for given WCAG level */
  async assertNoViolations(options?: A11yOptions): Promise<void> {
    const violations = await this.scan(options);

    if (violations.length > 0) {
      const summary = violations
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description} (${v.nodes} element${v.nodes > 1 ? 's' : ''})`,
        )
        .join('\n');

      expect(
        violations.length,
        `Found ${violations.length} accessibility violation(s):\n${summary}`,
      ).toBe(0);
    }
  }

  /** Assert no critical or serious violations (allows moderate/minor) */
  async assertNoCriticalViolations(options?: A11yOptions): Promise<void> {
    const violations = await this.scan(options);
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

    if (critical.length > 0) {
      const summary = critical.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n');

      expect(
        critical.length,
        `Found ${critical.length} critical/serious a11y violation(s):\n${summary}`,
      ).toBe(0);
    }
  }

  /** Run WCAG 2.1 AA audit (most common compliance target) */
  async assertWCAG21AA(options?: Omit<A11yOptions, 'tags'>): Promise<void> {
    await this.assertNoViolations({ ...options, tags: ['wcag21aa', 'wcag2aa'] });
  }

  /** Print violations report to console */
  printViolations(violations: A11yViolation[]): void {
    if (violations.length === 0) {
      console.log('  ✅ No accessibility violations found');
      return;
    }

    console.log(`  ❌ ${violations.length} violation(s):`);
    for (const v of violations) {
      console.log(`    [${v.impact}] ${v.id}: ${v.description}`);
      console.log(`      Affected: ${v.nodes} element(s)`);
      for (const target of v.targets) {
        console.log(`        → ${target}`);
      }
      console.log(`      Help: ${v.helpUrl}`);
    }
  }
}
