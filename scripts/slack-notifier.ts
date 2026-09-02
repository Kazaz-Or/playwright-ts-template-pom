/**
 * Slack notification helper for test results.
 *
 * Usage:
 *   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... ts-node scripts/slack-notifier.ts
 *
 * Reads Playwright JSON report and sends a formatted Slack message.
 * Intended to be called from CI after test runs.
 */

import * as fs from 'fs';
import logger from '../utils/logger';
import * as path from 'path';
import { SlackPayload, TestSummary } from './types';

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const REPORT_PATH = path.resolve(__dirname, '../test-results/results.json');

function parseResults(): TestSummary {
  // ponytail: reads Playwright JSON reporter output
  // Add `['json', { outputFile: 'test-results/results.json' }]` to reporters in config
  if (!fs.existsSync(REPORT_PATH)) {
    return { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0, failures: [] };
  }

  const raw = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
  const suites = raw.suites || [];
  const failures: { test: string; error: string; file: string }[] = [];
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function walkSpecs(specs: any[]) {
    for (const spec of specs) {
      for (const test of spec.tests || []) {
        total++;
        const status = test.status || test.results?.[0]?.status;
        if (status === 'passed' || status === 'expected') passed++;
        else if (status === 'skipped') skipped++;
        else {
          failed++;
          const errorMsg = test.results?.[0]?.error?.message || 'Unknown error';
          failures.push({
            test: spec.title || spec.file,
            error: errorMsg.slice(0, 200),
            file: spec.file || '',
          });
        }
      }
    }
  }

  function walkSuites(suites: any[]) {
    for (const suite of suites) {
      walkSpecs(suite.specs || []);
      walkSuites(suite.suites || []);
    }
  }

  walkSuites(suites);

  return {
    total,
    passed,
    failed,
    skipped,
    duration: raw.stats?.duration || 0,
    failures,
  };
}

function buildSlackPayload(summary: TestSummary, runUrl?: string): SlackPayload {
  const statusEmoji = summary.failed === 0 ? ':white_check_mark:' : ':x:';
  const statusText = summary.failed === 0 ? 'All Tests Passed' : `${summary.failed} Test(s) Failed`;

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${statusEmoji} E2E Test Results: ${statusText}` },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Total:* ${summary.total}` },
        { type: 'mrkdwn', text: `*Passed:* ${summary.passed}` },
        { type: 'mrkdwn', text: `*Failed:* ${summary.failed}` },
        { type: 'mrkdwn', text: `*Skipped:* ${summary.skipped}` },
        { type: 'mrkdwn', text: `*Duration:* ${(summary.duration / 1000).toFixed(1)}s` },
      ],
    },
  ];

  if (summary.failures.length > 0) {
    const failureText = summary.failures
      .slice(0, 5)
      .map((f) => `• *${f.test}*\n  \`${f.error}\``)
      .join('\n');

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Failed Tests:*\n${failureText}` },
    });
  }

  if (runUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View CI Run' },
          url: runUrl,
        },
      ],
    });
  }

  return { blocks };
}

async function sendToSlack(payload: SlackPayload): Promise<void> {
  if (!WEBHOOK_URL) {
    logger.info('[slack-notifier] No SLACK_WEBHOOK_URL set. Printing payload:');
    logger.info(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    logger.error(`[slack-notifier] Failed to send: ${response.status} ${response.statusText}`);
  } else {
    logger.info('[slack-notifier] Notification sent successfully');
  }
}

async function main() {
  const summary = parseResults();
  const runUrl = process.env.GITHUB_RUN_URL || process.env.CI_PIPELINE_URL;
  const payload = buildSlackPayload(summary, runUrl);
  await sendToSlack(payload);
}

main().catch((e) => logger.error(String(e)));
