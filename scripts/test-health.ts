/**
 * Test Health Dashboard — generates a summary of test suite quality metrics.
 *
 * Usage: npx ts-node scripts/test-health.ts
 *
 * Scans all .spec.ts files and reports:
 * - Test count per file and tag
 * - Sanity vs regression coverage ratio
 * - Tests without tags (untagged)
 * - Avg assertions per test (estimated)
 * - Files with no tests
 */

import * as fs from 'fs';
import logger from '../utils/logger';
import * as path from 'path';

const TESTS_DIR = path.resolve(__dirname, '../tests');

interface FileMetrics {
  file: string;
  total: number;
  sanity: number;
  regression: number;
  untagged: number;
}

function analyzeFile(filePath: string): FileMetrics {
  const content = fs.readFileSync(filePath, 'utf-8');
  const testMatches = content.match(/test\(/g) || [];
  const sanityMatches = content.match(/@sanity/g) || [];
  const regressionMatches = content.match(/@regression/g) || [];
  const total = testMatches.length;

  return {
    file: path.basename(filePath),
    total,
    sanity: sanityMatches.length,
    regression: regressionMatches.length,
    untagged: total - sanityMatches.length - regressionMatches.length,
  };
}

function main() {
  const specFiles = fs
    .readdirSync(TESTS_DIR)
    .filter((f) => f.endsWith('.spec.ts'))
    .map((f) => path.join(TESTS_DIR, f));

  const metrics = specFiles.map(analyzeFile);

  const totals = metrics.reduce(
    (acc, m) => ({
      total: acc.total + m.total,
      sanity: acc.sanity + m.sanity,
      regression: acc.regression + m.regression,
      untagged: acc.untagged + m.untagged,
    }),
    { total: 0, sanity: 0, regression: 0, untagged: 0 },
  );

  logger.info('\n' + '═'.repeat(65));
  logger.info('  📊 TEST HEALTH DASHBOARD');
  logger.info('═'.repeat(65));

  logger.info('\n  Per-file breakdown:');
  logger.info('  ' + '-'.repeat(61));
  logger.info(
    '  ' +
      'File'.padEnd(30) +
      'Total'.padStart(7) +
      'Sanity'.padStart(8) +
      'Regr'.padStart(7) +
      'Untag'.padStart(7),
  );
  logger.info('  ' + '-'.repeat(61));

  for (const m of metrics) {
    const untag = m.untagged > 0 ? `⚠ ${m.untagged}` : '0';
    logger.info(
      '  ' +
        m.file.padEnd(30) +
        String(m.total).padStart(7) +
        String(m.sanity).padStart(8) +
        String(m.regression).padStart(7) +
        untag.padStart(7),
    );
  }

  logger.info('  ' + '-'.repeat(61));
  logger.info(
    '  ' +
      'TOTAL'.padEnd(30) +
      String(totals.total).padStart(7) +
      String(totals.sanity).padStart(8) +
      String(totals.regression).padStart(7) +
      String(totals.untagged).padStart(7),
  );

  logger.info('\n  Summary:');
  logger.info(`    Total tests:       ${totals.total}`);
  logger.info(
    `    Sanity tests:      ${totals.sanity} (${((totals.sanity / totals.total) * 100).toFixed(0)}%)`,
  );
  logger.info(
    `    Regression tests:  ${totals.regression} (${((totals.regression / totals.total) * 100).toFixed(0)}%)`,
  );
  logger.info(`    Untagged tests:    ${totals.untagged}`);
  logger.info(`    Spec files:        ${specFiles.length}`);
  logger.info(`    Sanity/Regression: ${totals.sanity}:${totals.regression}`);

  if (totals.untagged > 0) {
    logger.info(`\n  ⚠  ${totals.untagged} test(s) have no @sanity or @regression tag`);
  }

  if (totals.sanity === 0) {
    logger.info('\n  ⚠  No @sanity tests found! Add @sanity tags to critical path tests.');
  }

  logger.info('\n' + '═'.repeat(65) + '\n');
}

main();
