import { faker } from '@faker-js/faker';
import { BlogTestData, SearchTestData } from './types';

/**
 * Test data factory — generates dynamic test data using faker.
 *
 * Use for parameterized tests, fuzzing, and avoiding hardcoded values.
 * Static data in blog.data.ts/search.data.ts is for known-entity tests;
 * factory is for exploratory and boundary tests.
 */
export class TestDataFactory {
  /** Generate a random search query */
  static searchQuery(): string {
    return faker.lorem.word();
  }

  /** Generate a search query that should return no results */
  static noResultsQuery(): string {
    return faker.string.alphanumeric(20) + 'xyz';
  }

  /** Generate search test data */
  static searchTestData(count = 5): SearchTestData[] {
    return Array.from({ length: count }, () => ({
      query: faker.lorem.word(),
      shouldHaveResults: true, // unknown — use for exploratory
      expectedResultsMinCount: 0,
    }));
  }

  /** Generate a random blog slug (for negative/404 tests) */
  static fakeBlogSlug(): string {
    return faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
  }

  /** Generate fake blog test data (for testing test infrastructure) */
  static blogTestData(count = 3): BlogTestData[] {
    return Array.from({ length: count }, () => ({
      slug: faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      tags: faker.helpers.arrayElements(
        ['Python', 'Testing', 'JavaScript', 'Linux', 'DevOps', 'AI'],
        { min: 1, max: 3 },
      ),
      hasCodeBlocks: faker.datatype.boolean(),
    }));
  }

  /** Generate a random email (for newsletter form testing) */
  static email(): string {
    return faker.internet.email();
  }

  /** Generate a random user agent string */
  static userAgent(): string {
    return faker.internet.userAgent();
  }

  /** Generate special characters string (for XSS/injection boundary tests) */
  static specialChars(): string {
    return faker.helpers.arrayElement([
      '<script>alert(1)</script>',
      '"><img src=x onerror=alert(1)>',
      "'; DROP TABLE posts; --",
      '../../etc/passwd',
      '{{7*7}}',
      '${7*7}',
      '%00',
      '\x00\x01\x02',
    ]);
  }

  /** Generate a list of common XSS payloads for security testing */
  static xssPayloads(): string[] {
    return [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '<svg onload=alert(1)>',
      '"><script>alert(1)</script>',
    ];
  }

  /** Generate long text (for overflow/truncation testing) */
  static longText(length = 500): string {
    return faker.lorem.paragraphs(Math.ceil(length / 100));
  }

  /** Generate viewport dimensions for responsive testing */
  static viewports(): { width: number; height: number; label: string }[] {
    return [
      { width: 320, height: 568, label: 'iPhone SE' },
      { width: 375, height: 667, label: 'iPhone 8' },
      { width: 390, height: 844, label: 'iPhone 14' },
      { width: 768, height: 1024, label: 'iPad' },
      { width: 1024, height: 768, label: 'iPad Landscape' },
      { width: 1280, height: 720, label: 'HD Laptop' },
      { width: 1440, height: 900, label: 'Desktop' },
      { width: 1920, height: 1080, label: 'Full HD' },
      { width: 2560, height: 1440, label: '2K' },
    ];
  }
}
