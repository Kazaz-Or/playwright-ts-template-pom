/**
 * URL utility functions for building and validating test URLs.
 */

export function buildUrl(base: string, path: string): string {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function extractSlugFromUrl(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function isRelativeUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

export function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase();
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
