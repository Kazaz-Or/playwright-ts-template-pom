import { defineConfig, devices } from '@playwright/test';
import { EnvConfig } from './config/env.config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: EnvConfig.isCI,
  retries: EnvConfig.retries,
  workers: EnvConfig.workers,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(EnvConfig.isCI ? [['github'] as ['github']] : []),
    // Allure reporter — generates rich reports with history, trends, categories
    // View with: npx allure serve allure-results
    ['allure-playwright', { outputFolder: 'allure-results' }],
    // Custom reporter with Slack + LLM analysis:
    // ['./scripts/custom-reporter.ts', { slack: true, llmAnalysis: true }],
  ],
  use: {
    baseURL: EnvConfig.baseUrl,
    trace: 'retain-on-failure',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
});
