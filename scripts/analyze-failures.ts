/**
 * LLM-powered test failure analyzer.
 *
 * Reads Playwright error-context.md files from test-results/ and sends them
 * to an LLM API for root-cause analysis and fix suggestions.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npm run test:analyze-failures
 *   OPENAI_API_KEY=sk-...   npm run test:analyze-failures
 *
 * Supports both Anthropic Claude and OpenAI as backends.
 * Falls back to a local summary if no API key is set.
 */

import * as fs from 'fs';
import * as path from 'path';
import { FailureAnalysis } from './types';

const TEST_RESULTS_DIR = path.resolve(__dirname, '../test-results');

function collectFailureContexts(): { testName: string; context: string }[] {
  if (!fs.existsSync(TEST_RESULTS_DIR)) return [];

  const dirs = fs
    .readdirSync(TEST_RESULTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const failures: { testName: string; context: string }[] = [];

  for (const dir of dirs) {
    const contextFile = path.join(TEST_RESULTS_DIR, dir.name, 'error-context.md');
    if (fs.existsSync(contextFile)) {
      const context = fs.readFileSync(contextFile, 'utf-8');
      failures.push({ testName: dir.name, context });
    }
  }

  return failures;
}

async function analyzeWithClaude(
  failures: { testName: string; context: string }[],
): Promise<FailureAnalysis[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const results: FailureAnalysis[] = [];

  for (const failure of failures) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a senior test automation engineer. Analyze this Playwright test failure and provide:
1. Root cause (1-2 sentences)
2. Suggested fix (code snippet if applicable)
3. Whether this is likely a test issue, app issue, or environment issue

Failure context:
${failure.context.slice(0, 3000)}`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const analysis = data.content?.[0]?.text || 'No analysis available';
      results.push({
        testName: failure.testName,
        analysis,
        category: categorizeFromAnalysis(analysis),
      });
    }
  }

  return results;
}

async function analyzeWithOpenAI(
  failures: { testName: string; context: string }[],
): Promise<FailureAnalysis[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const results: FailureAnalysis[] = [];

  for (const failure of failures) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior test automation engineer. Analyze Playwright test failures concisely.',
          },
          {
            role: 'user',
            content: `Analyze this failure. Give: root cause, suggested fix, category (test/app/env issue).\n\n${failure.context.slice(0, 3000)}`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || 'No analysis available';
      results.push({
        testName: failure.testName,
        analysis,
        category: categorizeFromAnalysis(analysis),
      });
    }
  }

  return results;
}

function categorizeFromAnalysis(analysis: string): 'test' | 'app' | 'environment' | 'unknown' {
  const lower = analysis.toLowerCase();
  if (lower.includes('test issue') || lower.includes('selector') || lower.includes('locator'))
    return 'test';
  if (lower.includes('app issue') || lower.includes('application') || lower.includes('bug'))
    return 'app';
  if (lower.includes('environment') || lower.includes('network') || lower.includes('timeout'))
    return 'environment';
  return 'unknown';
}

function localAnalysis(failures: { testName: string; context: string }[]): FailureAnalysis[] {
  return failures.map((f) => {
    const lines = f.context.split('\n');
    const errorLine = lines.find((l) => l.startsWith('Error:')) || 'Unknown error';
    const isTimeout = errorLine.toLowerCase().includes('timeout');
    const isLocator =
      errorLine.includes('locator') ||
      errorLine.includes('resolved to') ||
      errorLine.includes('not found');
    const isAssert = errorLine.includes('expect') || errorLine.includes('toBe');

    let category: 'test' | 'app' | 'environment' | 'unknown' = 'unknown';
    let analysis = '';

    if (isTimeout) {
      category = 'environment';
      analysis = `Timeout failure. Element not found within time limit. Check if the selector is correct or if the page loads slowly.`;
    } else if (isLocator) {
      category = 'test';
      analysis = `Locator issue. The selector may not match the current page structure. Verify selectors against the actual DOM.`;
    } else if (isAssert) {
      category = 'app';
      analysis = `Assertion failure. Expected value doesn't match actual. Could be an app regression or outdated test data.`;
    } else {
      analysis = `Review the error context manually: ${errorLine.slice(0, 150)}`;
    }

    return { testName: f.testName, analysis, category };
  });
}

function printReport(analyses: FailureAnalysis[]): void {
  if (analyses.length === 0) {
    console.log('\n✅ No failures to analyze.\n');
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 FAILURE ANALYSIS REPORT (${analyses.length} failures)`);
  console.log(`${'='.repeat(60)}\n`);

  const grouped = {
    test: [] as FailureAnalysis[],
    app: [] as FailureAnalysis[],
    environment: [] as FailureAnalysis[],
    unknown: [] as FailureAnalysis[],
  };
  for (const a of analyses) grouped[a.category].push(a);

  const labels = {
    test: '🧪 Test Issues',
    app: '🐛 App Issues',
    environment: '🌐 Environment Issues',
    unknown: '❓ Uncategorized',
  };

  for (const [cat, items] of Object.entries(grouped)) {
    if (items.length === 0) continue;
    console.log(`\n${labels[cat as keyof typeof labels]} (${items.length}):`);
    console.log(`${'-'.repeat(40)}`);
    for (const item of items) {
      console.log(`\n  📋 ${item.testName}`);
      console.log(`     ${item.analysis.replace(/\n/g, '\n     ')}`);
    }
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

async function main() {
  const failures = collectFailureContexts();

  if (failures.length === 0) {
    console.log('✅ No failure contexts found in test-results/');
    return;
  }

  console.log(`Found ${failures.length} failure(s) to analyze...`);

  let analyses: FailureAnalysis[];

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('Using Claude for analysis...');
    analyses = await analyzeWithClaude(failures);
  } else if (process.env.OPENAI_API_KEY) {
    console.log('Using OpenAI for analysis...');
    analyses = await analyzeWithOpenAI(failures);
  } else {
    console.log('No LLM API key found. Using local pattern-based analysis.');
    console.log('Set ANTHROPIC_API_KEY or OPENAI_API_KEY for AI-powered analysis.\n');
    analyses = localAnalysis(failures);
  }

  printReport(analyses);
}

main().catch(console.error);
