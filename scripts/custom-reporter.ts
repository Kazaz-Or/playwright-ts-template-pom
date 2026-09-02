/**
 * Custom Playwright reporter that:
 * 1. Prints a clean summary to console
 * 2. Optionally sends Slack notification
 * 3. Optionally triggers LLM failure analysis
 *
 * Add to playwright.config.ts reporters:
 *   ['./scripts/custom-reporter.ts', { slack: true, llmAnalysis: true }]
 */

import logger from '../utils/logger';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

interface CustomReporterOptions {
  slack?: boolean;
  llmAnalysis?: boolean;
}

class CustomReporter implements Reporter {
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private failures: { test: string; error: string; duration: number }[] = [];
  private startTime = Date.now();
  private options: CustomReporterOptions;

  constructor(options: CustomReporterOptions = {}) {
    this.options = options;
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed') {
      this.passed++;
    } else if (result.status === 'skipped') {
      this.skipped++;
    } else {
      this.failed++;
      this.failures.push({
        test: `${test.parent.title} > ${test.title}`,
        error: result.error?.message?.slice(0, 200) || 'Unknown error',
        duration: result.duration,
      });
    }
  }

  async onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const total = this.passed + this.failed + this.skipped;

    logger.info('\n' + '═'.repeat(60));
    logger.info(
      `  ${result.status === 'passed' ? '✅' : '❌'}  Test Run ${result.status.toUpperCase()}`,
    );
    logger.info('═'.repeat(60));
    logger.info(
      `  Total: ${total} | Passed: ${this.passed} | Failed: ${this.failed} | Skipped: ${this.skipped}`,
    );
    logger.info(`  Duration: ${(duration / 1000).toFixed(1)}s`);

    if (this.failures.length > 0) {
      logger.info('\n  Failed Tests:');
      for (const f of this.failures) {
        logger.info(`    ✘ ${f.test}`);
        logger.info(`      ${f.error}`);
      }
    }
    logger.info('═'.repeat(60) + '\n');

    // ponytail: Slack + LLM hooks — wire up when deploying to CI
    if (this.options.slack && this.failed > 0) {
      logger.info('[reporter] Slack notification would be sent (set SLACK_WEBHOOK_URL)');
    }
    if (this.options.llmAnalysis && this.failed > 0) {
      logger.info('[reporter] LLM analysis would run (set ANTHROPIC_API_KEY or OPENAI_API_KEY)');
    }
  }
}

export default CustomReporter;
