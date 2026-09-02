import { BlogTestData } from './types';

export const blogTestData: BlogTestData[] = [
  {
    slug: 'playwright-sounds-test',
    title: 'Testing Browser Audio with Playwright',
    tags: ['Testing', 'Playwright'],
    hasCodeBlocks: true,
  },
  {
    slug: 'goodbye-ubuntu-hello-fedora',
    title: 'Goodbye Ubuntu, Hello Fedora',
    tags: ['Linux', 'Fedora', 'Ubuntu'],
    hasCodeBlocks: false,
  },
  {
    slug: 'shell-command-nodejs',
    title: 'Executing Shell Commands in Node.js',
    tags: ['NodeJS', 'JavaScript'],
    hasCodeBlocks: true,
  },
  {
    slug: 'nano-claw-agent',
    title: 'Autonomous Knowledge Assistant with NanoClaw',
    tags: ['AI', 'Python'],
    hasCodeBlocks: true,
  },
];

export const featuredBlogSlug = 'playwright-sounds-test';

export const nonExistentBlogSlug = 'this-blog-does-not-exist-xyz-123';
