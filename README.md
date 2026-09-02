# Playwright POM Template

A production-ready Playwright E2E testing framework using the **Page Object Model** pattern. Built as a reusable baseline — clone it, point it at your app, and start writing tests.

<img width="2172" height="724" alt="ec650490-67ae-41ee-899e-3dbd94adecd7" src="https://github.com/user-attachments/assets/7cb3f61c-40f0-4199-bfc8-509a74d35d84" />

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Writing Tests](#writing-tests)
  - [Using Page Objects](#using-page-objects)
  - [Using Helpers](#using-helpers)
  - [Using the Test Data Factory](#using-the-test-data-factory)
  - [API Testing](#api-testing)
  - [Accessibility Testing](#accessibility-testing)
  - [Performance Testing](#performance-testing)
  - [Security Testing](#security-testing)
- [Test Tagging Strategy](#test-tagging-strategy)
- [Running Tests](#running-tests)
- [Reports](#reports)
- [CI/CD Pipeline](#cicd-pipeline)
- [Scripts & Tooling](#scripts--tooling)
- [Configuration](#configuration)
- [Adapting This Template](#adapting-this-template)
- [FAQ](#faq)

---

## Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Install browsers
npx playwright install --with-deps

# 3. Run all tests
yarn test

# 4. Run sanity tests only (fast gate)
yarn test:sanity

# 5. Open the HTML report
yarn test:report
```

---

## Project Structure

```
playwright-ts-template-pom/
├── api/               → API request helpers + types
├── components/        → Shared UI components (navbar, footer, search)
├── config/            → Environment configuration (dotenv-based)
├── constants/         → Enums, routes, tags, test IDs, performance budgets
├── data/              → Static test data + faker-based factory
├── fixtures/          → Extended Playwright fixtures (dependency injection)
├── helpers/           → Assertion, navigation, page, performance, a11y helpers
├── pages/             → Page Objects (base, home, blogs, blog-post, about, tags, tag)
├── scripts/           → Slack notifier, LLM failure analyzer, custom reporter, test health
├── utils/             → Pure utilities (date, string, URL, logger)
├── tests/             → 16 spec files (101 tests)
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── yarn.lock
└── package.json
```

Each directory has a `types.ts` file exporting its interfaces and types.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                      Test Spec Files                     │
│                  (tests/*.spec.ts)                        │
├──────────────────────────────────────────────────────────┤
│                     Fixtures Layer                        │
│              (fixtures/base.fixture.ts)                   │
│   Injects: page objects, helpers, API clients             │
├──────────────┬───────────────┬────────────────────────────┤
│ Page Objects │  Helpers      │  API Layer                 │
│ (pages/)     │  (helpers/)   │  (api/)                    │
│              │               │                            │
│ HomePage     │ Assertions    │ BlogApi                    │
│ BlogsPage    │ Navigation    │                            │
│ BlogPostPage │ PageHelper    │                            │
│ AboutPage    │ Performance   │                            │
│ TagsPage     │ Accessibility │                            │
│ TagPage      │               │                            │
├──────────────┴───────────────┴────────────────────────────┤
│              Components (navbar, footer, search)          │
├──────────────────────────────────────────────────────────┤
│    Config  │  Constants  │  Data/Factory  │  Utils        │
└──────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Page Objects** encapsulate locators and page-specific actions. Tests never call `page.locator()` directly.
- **Fixtures** inject page objects and helpers via Playwright's dependency injection — no manual instantiation in tests.
- **Helpers** are stateless, reusable assertion/navigation/performance utilities shared across all tests.
- **Components** (navbar, footer) are composed into page objects via `BasePage`, available on every page.
- **Semantic selectors** preferred: `getByRole()` > `getByText()` > CSS selectors.

---

## Writing Tests

### Using Page Objects

Every test imports `test` and `expect` from the fixtures file — **not** from `@playwright/test`:

```typescript
// ✅ Correct — uses extended fixtures
import { test, expect } from '../fixtures/base.fixture';

// ❌ Wrong — won't have page objects or helpers
import { test, expect } from '@playwright/test';
```

**Basic page object test:**

```typescript
import { test, expect } from '../fixtures/base.fixture';

test.describe('Homepage', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display hero heading @sanity', async ({ homePage }) => {
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroTitle).toContainText('Kazi');
  });

  test('should display blog cards @sanity', async ({ homePage, assertions }) => {
    await assertions.assertCountAtLeast(homePage.blogCards, 1);
  });

  test('clicking Explore Articles navigates to blogs @regression', async ({ homePage }) => {
    await homePage.clickExploreArticles();
    await expect(homePage.page).toHaveURL(/\/blogs/);
  });
});
```

**Available fixtures** (destructure any combination in your test):

| Fixture        | Type                  | Description                       |
| -------------- | --------------------- | --------------------------------- |
| `homePage`     | `HomePage`            | Homepage page object              |
| `blogsPage`    | `BlogsPage`           | Blog listing page object          |
| `blogPostPage` | `BlogPostPage`        | Individual blog post page object  |
| `aboutPage`    | `AboutPage`           | About page object                 |
| `tagsPage`     | `TagsPage`            | Tags listing page object          |
| `tagPage`      | `TagPage`             | Individual tag filter page object |
| `assertions`   | `AssertionsHelper`    | Domain-specific assertions        |
| `navigation`   | `NavigationHelper`    | Navigation utilities              |
| `pageHelper`   | `PageHelper`          | Page-level utilities              |
| `performance`  | `PerformanceHelper`   | Web Vitals measurement            |
| `a11y`         | `AccessibilityHelper` | axe-core WCAG scanning            |
| `blogApi`      | `BlogApi`             | API request helpers               |

### Using Helpers

**Assertions helper** — domain-specific checks reusable across all tests:

```typescript
test('should have proper meta tags @regression', async ({ page, assertions }) => {
  await page.goto('/blogs/my-post');

  // Title check
  await assertions.assertTitleContains('my post');

  // URL check
  await assertions.assertUrlContains(/\/blogs\/my-post/);

  // Meta tags
  await assertions.assertMetaTag({ property: 'og:title', content: 'My Post' });
  await assertions.assertOpenGraphTags();

  // Element visibility
  await assertions.assertVisible(page.getByRole('heading', { level: 1 }));

  // Count checks
  await assertions.assertCountAtLeast(page.locator('article'), 1);

  // Image integrity
  await assertions.assertNoImageErrors();

  // Heading structure
  await assertions.assertHasHeadings();
});
```

**Navigation helper:**

```typescript
test('back button works @regression', async ({ navigation }) => {
  await navigation.goTo('/blogs');
  await navigation.goTo('/about');
  await navigation.goBack();
  // Now on /blogs
  await navigation.assertLinkNavigation('About', /\/about/);
});
```

**Page helper:**

```typescript
test('page loads within budget @regression', async ({ pageHelper }) => {
  await pageHelper.assertPageLoadsWithin('/blogs', 5000);

  // Take screenshot for visual reference
  await pageHelper.takeScreenshot('blogs-page');

  // Collect console errors
  const errors = await pageHelper.collectConsoleErrors();
  expect(errors).toHaveLength(0);
});
```

### Using the Test Data Factory

The `TestDataFactory` generates dynamic test data via [faker.js](https://fakerjs.dev/). Use it for parameterized tests, fuzzing, and boundary testing:

```typescript
import { TestDataFactory } from '../data/factory';

test('search handles random queries @regression', async ({ homePage }) => {
  await homePage.navigate();

  // Random word — exploratory testing
  const query = TestDataFactory.searchQuery();
  await homePage.navbar.search(query);

  // Query guaranteed to return no results
  const noResultsQuery = TestDataFactory.noResultsQuery();
  await homePage.navbar.search(noResultsQuery);
});

test('404 page for fake slugs @regression', async ({ page }) => {
  const slug = TestDataFactory.fakeBlogSlug();
  const response = await page.goto(`/blogs/${slug}`);
  expect(response?.status()).toBe(404);
});

test('XSS payloads are handled safely @regression', async ({ homePage }) => {
  await homePage.navigate();
  for (const payload of TestDataFactory.xssPayloads()) {
    await homePage.navbar.search(payload);
    const title = await homePage.page.title();
    expect(title).not.toContain('xss');
    await homePage.navbar.clearSearch();
  }
});
```

**Available factory methods:**

| Method              | Returns            | Use Case                     |
| ------------------- | ------------------ | ---------------------------- |
| `searchQuery()`     | `string`           | Random word for search tests |
| `noResultsQuery()`  | `string`           | Guaranteed no-match query    |
| `fakeBlogSlug()`    | `string`           | Random slug for 404 tests    |
| `blogTestData(n)`   | `BlogTestData[]`   | Fake blog entries            |
| `searchTestData(n)` | `SearchTestData[]` | Bulk search queries          |
| `email()`           | `string`           | Random email for form tests  |
| `specialChars()`    | `string`           | XSS/injection payloads       |
| `xssPayloads()`     | `string[]`         | Common XSS attack vectors    |
| `longText(len)`     | `string`           | Overflow/truncation testing  |
| `viewports()`       | `{w, h, label}[]`  | 9 standard viewport sizes    |

### API Testing

Test endpoints without a browser using [axios](https://axios-http.com/):

```typescript
import { test, expect } from '../fixtures/base.fixture';

test.describe('API Tests', () => {
  test('all main pages return 200 @sanity', async ({ blogApi }) => {
    const pages = ['/', '/blogs', '/about', '/tags'];
    for (const path of pages) {
      const exists = await blogApi.checkPageExists(path);
      expect(exists, `${path} should be accessible`).toBeTruthy();
    }
  });

  test('non-existent page returns 404 @regression', async ({ blogApi }) => {
    const exists = await blogApi.checkPageExists('/this-does-not-exist');
    expect(exists).toBeFalsy();
  });
});
```

### Accessibility Testing

Two levels of a11y testing are built in:

**1. axe-core automated scanning** (`a11y` fixture):

```typescript
import { test } from '../fixtures/base.fixture';

// Track known site issues — exclude from strict checks, fix later
const KNOWN_ISSUES = ['color-contrast', 'svg-img-alt'];

test('homepage has no critical a11y violations @sanity', async ({ page, a11y }) => {
  await page.goto('/');
  await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
});

test('full WCAG 2.1 AA audit @regression', async ({ page, a11y }) => {
  await page.goto('/');
  const violations = await a11y.scan({ tags: ['wcag21aa', 'wcag2aa'] });
  a11y.printViolations(violations); // Informational — logs all violations
});

test('navigation component is accessible @regression', async ({ page, a11y }) => {
  await page.goto('/');
  await a11y.assertNoCriticalViolations({
    includeSelector: 'nav', // Scope scan to navbar only
    disableRules: KNOWN_ISSUES,
  });
});
```

**Available a11y methods:**

| Method                         | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `scan(options?)`               | Full axe scan, returns violations array       |
| `assertNoViolations()`         | Fails if any violations found                 |
| `assertNoCriticalViolations()` | Fails only on critical/serious (allows minor) |
| `assertWCAG21AA()`             | Strict WCAG 2.1 AA compliance check           |
| `printViolations()`            | Pretty-prints violations to console           |

**Scan options:**

```typescript
{
  tags?: string[];           // WCAG tags: ['wcag21aa', 'wcag2aa', 'best-practice']
  disableRules?: string[];   // Rule IDs to skip: ['color-contrast']
  includeSelector?: string;  // Scope scan to selector: 'nav', 'footer', 'main'
  excludeSelector?: string;  // Exclude from scan: '.ad-banner'
}
```

**2. Manual a11y checks** (in `accessibility.spec.ts`):

```typescript
test('page should have lang attribute @sanity', async ({ page }) => {
  await page.goto('/');
  const lang = await page.locator('html').getAttribute('lang');
  expect(lang).toBeTruthy();
});

test('all images should have alt text @regression', async ({ page }) => {
  await page.goto('/');
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt, `Image missing alt: ${await img.getAttribute('src')}`).toBeTruthy();
  }
});
```

### Performance Testing

Measure Web Vitals and assert against performance budgets:

```typescript
import { test, expect } from '../fixtures/base.fixture';
import { PerformanceBudgets } from '../constants/performance.constants';

test('homepage meets performance budget @regression', async ({ page, performance }) => {
  await page.goto('/');
  await page.waitForLoadState('load');

  // Assert against predefined budget (TTFB, FCP, DCL, Load, resources, transfer)
  const metrics = await performance.assertBudget(PerformanceBudgets.static);
  performance.printMetrics(metrics);
});

test('LCP under 3 seconds @regression', async ({ page, performance }) => {
  await page.goto('/');
  await page.waitForLoadState('load');
  const lcp = await performance.getLCP();
  expect(lcp, `LCP was ${lcp.toFixed(0)}ms`).toBeLessThan(3000);
});

test('CLS under 0.1 @regression', async ({ page, performance }) => {
  await page.goto('/');
  await page.waitForLoadState('load');
  const cls = await performance.getCLS();
  expect(cls, `CLS was ${cls.toFixed(3)}`).toBeLessThan(0.1);
});
```

**Performance budgets** are defined in `constants/performance.constants.ts`:

```typescript
export const PerformanceBudgets = {
  static: {
    ttfb: 800, // Time to First Byte (ms)
    fcp: 2000, // First Contentful Paint (ms)
    domContentLoaded: 3000, // DOM Content Loaded (ms)
    loadComplete: 5000, // Full page load (ms)
    maxResourceCount: 100, // Max HTTP requests
    maxTransferSize: 5 * 1024 * 1024, // Max transfer size (bytes)
  },
  blogListing: {/* looser budgets for dynamic content */},
  blogPost: {/* budgets for individual posts */},
};
```

### Security Testing

Boundary tests for XSS, injection, and path traversal:

```typescript
import { test, expect } from '../fixtures/base.fixture';
import { TestDataFactory } from '../data/factory';

test('XSS payloads in search @regression', async ({ homePage }) => {
  await homePage.navigate();
  for (const payload of TestDataFactory.xssPayloads()) {
    await homePage.navbar.search(payload);
    const title = await homePage.page.title();
    expect(title).not.toContain('xss');
    await homePage.navbar.clearSearch();
  }
});

test('special chars in URLs should not cause 500 @regression', async ({ page }) => {
  const paths = ['/blogs/<script>alert(1)</script>', '/blogs/../../etc/passwd', '/tags/%00%01%02'];

  for (const p of paths) {
    const response = await page.goto(p);
    expect(response?.status(), `${p} returned 500`).not.toBe(500);
  }
});
```

---

## Test Tagging Strategy

Every test is tagged as either `@sanity` or `@regression`:

| Tag           | Purpose                                  | Count | Runtime |
| ------------- | ---------------------------------------- | ----- | ------- |
| `@sanity`     | Critical path — must pass before merge   | 28    | ~8s     |
| `@regression` | Full coverage — runs after sanity passes | 73    | ~40s    |

**Tagging guidelines:**

- **`@sanity`**: Page loads, core navigation, critical user flows. Should run fast (<10s total).
- **`@regression`**: Everything else — edge cases, SEO, performance, a11y, security.

Add the tag at the end of the test title:

```typescript
test('critical flow @sanity', async ({ ... }) => { });
test('edge case @regression', async ({ ... }) => { });
```

**CI behavior**: Sanity runs first. If sanity fails, regression is skipped entirely.

---

## Running Tests

```bash
# All tests
yarn test

# By tag
yarn test:sanity                     # @sanity only
yarn test:regression                 # @regression only
yarn test:sanity-then-regression     # Sanity gate → regression

# By browser
yarn test:chrome
yarn test:firefox
yarn test:webkit
yarn test:mobile                     # Pixel 5 + iPhone 12

# Debug
yarn test:debug                      # Step-through debugger
yarn test:ui                         # Playwright UI mode
yarn test:headed                     # Watch in browser

# Single file
npx playwright test tests/home.spec.ts

# Single test by title
npx playwright test -g "should display hero heading"

# Sharded (for CI or large suites)
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

---

## Reports

### Playwright HTML Report

Generated automatically after every run.

```bash
yarn test:report
```

### Allure Report

Rich interactive reports with history, trends, and categories.

```bash
# Start Allure server (opens browser)
yarn allure:serve

# Generate static HTML report
yarn allure:generate
```

### Test Health Dashboard

Quick overview of test suite composition and tagging:

```bash
yarn test:health
```

Output:

```
═════════════════════════════════════════════════════════════════
  📊 TEST HEALTH DASHBOARD
═════════════════════════════════════════════════════════════════

  Per-file breakdown:
  -------------------------------------------------------------
  File                          Total  Sanity   Regr  Untag
  -------------------------------------------------------------
  home.spec.ts                      11       5      6      0
  blogs.spec.ts                      7       3      4      0
  blog-post.spec.ts                  8       2      6      0
  ...
  -------------------------------------------------------------
  TOTAL                            101      28     73      0

  Summary:
    Total tests:       101
    Sanity tests:      28 (28%)
    Regression tests:  73 (72%)
    Untagged tests:    0
    Spec files:        16
```

---

## CI/CD Pipeline

Two GitHub Actions workflows:

### E2E Tests (`.github/workflows/e2e-tests.yml`)

```
┌─────────────────────┐     ┌───────────────────────────┐     ┌────────────────────────┐     ┌──────────────┐
│ Sanity (per browser)│────▶│ Regression (3 shards      │────▶│ Merge & Deploy Report  │────▶│   Summary    │
│ chromium            │     │  × 3 browsers)            │     │ → GitHub Pages         │     │ (step summary│
│ firefox             │     │ chromium  1/3, 2/3, 3/3   │     │                        │     │  + report    │
│ webkit              │     │ firefox   1/3, 2/3, 3/3   │     │                        │     │  link)       │
│                     │     │ webkit    1/3, 2/3, 3/3   │     │                        │     │              │
└─────────────────────┘     └───────────────────────────┘     └────────────────────────┘     └──────────────┘
  If sanity fails,            Runs in parallel                  Merged HTML report            GitHub Step Summary
  regression skipped          across runners                    deployed to GitHub Pages      with Pages report URL
```

**Triggers**: Push to `master`, nightly cron at 04:00 UTC (07:00 Israel), manual dispatch.

### Static Checks (`.github/workflows/static-checks.yml`)

Runs on every push and PR: ESLint, Prettier, TypeScript type checking.

**Artifacts** (7-day retention):

- Playwright HTML report (per-shard + merged)
- Failure screenshots/traces (on failure)

**GitHub Pages setup**: Repo Settings → Pages → Source → **GitHub Actions**.

---

## Scripts & Tooling

### Slack Notifications

Sends Block Kit formatted messages after test runs.

```bash
# Set the webhook URL
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...

# Run manually
yarn test:analyze-failures
```

Without `SLACK_WEBHOOK_URL`, it prints the payload to the logger output (useful for testing the format).

### LLM Failure Analysis

Reads Playwright error contexts and categorizes failures as test/app/environment issues.

```bash
# With Claude (preferred)
export ANTHROPIC_API_KEY=sk-ant-...
yarn test:analyze-failures

# With OpenAI (fallback)
export OPENAI_API_KEY=sk-...
yarn test:analyze-failures

# Without API key — uses local pattern matching
yarn test:analyze-failures
```

Output:

```
════════════════════════════════════════════════════════════════
🔍 FAILURE ANALYSIS REPORT (3 failures)
════════════════════════════════════════════════════════════════

🧪 Test Issues (1):
────────────────────────────────────
  📋 home-should-display-hero
     Locator issue. The selector may not match the current page structure.

🐛 App Issues (1):
────────────────────────────────────
  📋 blogs-should-show-count
     Assertion failure. Expected value doesn't match actual.

🌐 Environment Issues (1):
────────────────────────────────────
  📋 performance-homepage-budget
     Timeout failure. Element not found within time limit.
```

### Custom Reporter

A pluggable Playwright reporter with optional Slack and LLM hooks:

```typescript
// playwright.config.ts
reporter: [
  ['./scripts/custom-reporter.ts', { slack: true, llmAnalysis: true }],
],
```

---

## Configuration

### Environment Variables

| Variable            | Default             | Description                               |
| ------------------- | ------------------- | ----------------------------------------- |
| `BASE_URL`          | `https://kazis.dev` | App under test                            |
| `CI`                | `false`             | Enables retries + GitHub reporter         |
| `SLOW_MO`           | `0`                 | Slow down actions (ms)                    |
| `RETRIES`           | CI=2, local=0       | Retry count                               |
| `WORKERS`           | CI=2, local=auto    | Parallel workers                          |
| `SLACK_WEBHOOK_URL` | —                   | Slack incoming webhook                    |
| `ANTHROPIC_API_KEY` | —                   | Claude API for failure analysis           |
| `OPENAI_API_KEY`    | —                   | OpenAI fallback for analysis              |
| `LOG_LEVEL`         | `info`              | Winston log level (debug/info/warn/error) |

Use a `.env` file for local development (it's in `.gitignore`):

```bash
# .env
BASE_URL=http://localhost:3000
SLOW_MO=100
```

### Browser Projects

Six projects configured in `playwright.config.ts`:

| Project         | Device / Engine         |
| --------------- | ----------------------- |
| `chromium`      | Desktop Chrome          |
| `firefox`       | Desktop Firefox         |
| `webkit`        | Desktop Safari          |
| `mobile-chrome` | Pixel 5                 |
| `mobile-safari` | iPhone 12               |
| `edge`          | Desktop Edge (Chromium) |

Run a specific project:

```bash
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome
```

---

## Adapting This Template

To use this template for a different application:

### 1. Update the base URL

```bash
# .env
BASE_URL=https://your-app.com
```

Or in `config/env.config.ts`:

```typescript
baseUrl: process.env.BASE_URL || 'https://your-app.com',
```

### 2. Update routes

Edit `constants/routes.enum.ts`:

```typescript
export enum Routes {
  Home = '/',
  Login = '/login',
  Dashboard = '/dashboard',
  Settings = '/settings',
}

export const userRoute = (id: string): string => `/users/${id}`;
```

### 3. Create page objects

Extend `BasePage` for each page:

```typescript
// pages/login.page.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Routes } from '../constants/routes.enum';

export class LoginPage extends BasePage {
  protected readonly path = Routes.Login;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.getByRole('alert');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### 4. Register in fixtures

Add your page object to `fixtures/base.fixture.ts`:

```typescript
import { LoginPage } from '../pages/login.page';

export const test = base.extend<TestFixtures>({
  // ... existing fixtures
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

And to `fixtures/types.ts`:

```typescript
export interface TestFixtures {
  // ... existing
  loginPage: LoginPage;
}
```

### 5. Write tests

```typescript
import { test, expect } from '../fixtures/base.fixture';

test.describe('Login', () => {
  test('should login with valid credentials @sanity', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password123');
    await expect(loginPage.page).toHaveURL(/\/dashboard/);
  });

  test('should show error for invalid credentials @regression', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('invalid@example.com', 'wrong');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
```

### 6. Update components

If your app has a different navbar/footer structure, update the components in `components/`:

```typescript
// components/navbar.component.ts
export class NavbarComponent implements IComponent {
  readonly root: Locator;
  readonly loginButton: Locator;
  readonly userMenu: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('navigation');
    this.loginButton = this.root.getByRole('link', { name: 'Sign In' });
    this.userMenu = this.root.getByRole('button', { name: /user menu/i });
  }
}
```

### 7. Update performance budgets

Adjust budgets in `constants/performance.constants.ts` based on your app's baseline:

```typescript
export const PerformanceBudgets = {
  static: {
    ttfb: 500,
    fcp: 1500,
    domContentLoaded: 2000,
    loadComplete: 4000,
    maxResourceCount: 80,
    maxTransferSize: 3 * 1024 * 1024,
  },
  dashboard: {
    ttfb: 1000,
    fcp: 3000,
    domContentLoaded: 5000,
    loadComplete: 10000,
    maxResourceCount: 200,
    maxTransferSize: 15 * 1024 * 1024,
  },
};
```

### 8. Update test data

Replace static test data in `data/` and extend the factory in `data/factory.ts`:

```typescript
export class TestDataFactory {
  static validCredentials() {
    return { email: 'test@example.com', password: 'Test1234!' };
  }

  static invalidEmails(): string[] {
    return ['not-an-email', '@missing-local', 'spaces in@email.com', ''];
  }
}
```

---

## FAQ

**Q: Why import from `fixtures/base.fixture` instead of `@playwright/test`?**

The base fixture extends Playwright's `test` with page objects and helpers via dependency injection. Importing from `@playwright/test` directly means tests won't have access to `homePage`, `assertions`, `a11y`, etc.

**Q: How do I add a new helper?**

1. Create the helper class in `helpers/` (e.g., `helpers/auth.helper.ts`)
2. Add its types to `helpers/types.ts`
3. Register it in `fixtures/base.fixture.ts` and `fixtures/types.ts`
4. Use it in tests by destructuring: `async ({ auth }) => { ... }`

**Q: How do I run tests against a local dev server?**

```bash
BASE_URL=http://localhost:3000 yarn test
```

Or use a `.env` file.

**Q: How do I add a new browser project?**

Add it to the `projects` array in `playwright.config.ts`:

```typescript
{ name: 'samsung-galaxy', use: { ...devices['Galaxy S9+'] } },
```

**Q: How do I handle known accessibility issues?**

Track them in a `KNOWN_ISSUES` array and pass to `disableRules`. Remove once fixed:

```typescript
const KNOWN_ISSUES = ['color-contrast', 'svg-img-alt'];
await a11y.assertNoCriticalViolations({ disableRules: KNOWN_ISSUES });
```

**Q: How do I adjust the sanity/regression split?**

Change the tag in the test title. Aim for sanity tests to be fast (<10s) and cover the critical path.

**Q: Can I use this with a monorepo?**

Yes. Set the `working-directory` in CI workflows and adjust the `testDir` in `playwright.config.ts`.

---

## Test Suites

| Spec            | Tests   | Sanity | Regression | Coverage                                     |
| --------------- | ------- | ------ | ---------- | -------------------------------------------- |
| `home`          | 11      | 5      | 6          | Hero, cards, nav links, Explore Articles     |
| `blogs`         | 7       | 3      | 4          | Listing, heading, card click, post count     |
| `blog-post`     | 8       | 2      | 6          | Title, content, date, tags, code blocks, 404 |
| `about`         | 7       | 3      | 4          | Heading, profile image, social links         |
| `tags`          | 9       | 3      | 6          | Tag list, click, Python/Playwright filter    |
| `search`        | 5       | 2      | 3          | Input, results, empty, clear                 |
| `navigation`    | 6       | 2      | 4          | Navbar routing, logo, back button, 404       |
| `a11y`          | 8       | 2      | 6          | axe-core WCAG audit per page                 |
| `accessibility` | 5       | 1      | 4          | Lang, alt text, keyboard, headings, links    |
| `api`           | 5       | 1      | 4          | Page availability, 404, RSS, headers (axios) |
| `seo`           | 8       | 1      | 7          | Title, OG tags, meta description, images     |
| `performance`   | 7       | 0      | 7          | Web Vitals budgets (TTFB, FCP, LCP, CLS)     |
| `responsive`    | 4       | 1      | 3          | Mobile/tablet/desktop viewports              |
| `security`      | 3       | 0      | 3          | XSS payloads, special char URLs              |
| `dark-mode`     | 4       | 1      | 3          | Theme toggle, dark/light switch, a11y label  |
| `rss`           | 4       | 1      | 3          | RSS feed XML, link tag, anchor link          |
| **Total**       | **101** | **28** | **73**     |                                              |

---

## License

MIT

---

Made with <3 by [Me](https://github.com/Kazaz-Or) :)

For anything - Feel free to approach me on [Linkedin](https://www.linkedin.com/in/kazaz-or/)
