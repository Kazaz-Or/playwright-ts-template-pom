/**
 * Date utility functions for test assertions.
 */

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function parseDisplayDate(displayDate: string): Date | null {
  const parsed = new Date(displayDate);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function isDateInPast(date: Date): boolean {
  return date < new Date();
}
