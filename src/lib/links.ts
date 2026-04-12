/**
 * Shared utilities for wiki link parsing and regex escaping.
 *
 * Centralises patterns that were previously duplicated across wiki.ts,
 * lifecycle.ts, and lint.ts.
 */

/**
 * Escape special regex characters in a string so it can be used
 * in a `new RegExp(...)` constructor safely.
 */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * A parsed wiki-style markdown link: `[text](slug.md)`
 */
export interface WikiLink {
  text: string;
  targetSlug: string;
}

/**
 * Extract all wiki-style markdown links from content.
 * Returns an array of { text, targetSlug } for each `[text](slug.md)` link found.
 */
export function extractWikiLinks(content: string): WikiLink[] {
  const results: WikiLink[] = [];
  const re = /\[([^\]]*)\]\(([^)]+)\.md\)/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    results.push({ text: match[1], targetSlug: match[2] });
  }
  return results;
}

/**
 * Test whether `content` contains a markdown link to `targetSlug.md`.
 */
export function hasLinkTo(content: string, targetSlug: string): boolean {
  const pattern = new RegExp(`\\]\\(${escapeRegex(targetSlug)}\\.md\\)`);
  return pattern.test(content);
}
