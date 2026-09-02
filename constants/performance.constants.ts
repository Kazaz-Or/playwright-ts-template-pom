import { PerformanceBudget } from '../helpers/types';

/**
 * Performance budgets per page type.
 * Tune these based on your baseline measurements.
 */
export const PerformanceBudgets: Record<string, PerformanceBudget> = {
  /** Static pages — homepage, about, tags */
  static: {
    ttfb: 800,
    fcp: 2000,
    domContentLoaded: 3000,
    loadComplete: 5000,
    maxResourceCount: 100,
    maxTransferSize: 5 * 1024 * 1024, // 5MB
  },

  /** Blog listing page — many cards, images */
  blogListing: {
    ttfb: 1000,
    fcp: 2500,
    domContentLoaded: 4000,
    loadComplete: 8000,
    maxResourceCount: 150,
    maxTransferSize: 10 * 1024 * 1024, // 10MB
  },

  /** Individual blog post — content-heavy, code blocks */
  blogPost: {
    ttfb: 800,
    fcp: 2000,
    domContentLoaded: 3500,
    loadComplete: 6000,
    maxResourceCount: 80,
    maxTransferSize: 5 * 1024 * 1024, // 5MB
  },
} as const;
