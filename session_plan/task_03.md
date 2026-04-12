Title: Extract shared link utilities to deduplicate escapeRegex and extractWikiLinks
Files: src/lib/links.ts (new), src/lib/wiki.ts, src/lib/lifecycle.ts, src/lib/lint.ts, src/lib/__tests__/lint.test.ts
Issue: none

## Problem

Three utility patterns are duplicated across modules:

1. **`escapeRegex` / `escapeRegExp`** — Identical function defined in both:
   - `lifecycle.ts` line 75: `const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");`
   - `wiki.ts` line 11: `function escapeRegExp(s: string): string { return s.replace(...) }`

2. **`extractWikiLinks`** — A function in `lint.ts` (line 97) that extracts all `[text](slug.md)` links from content. This same logic is needed (or partially reimplemented) in:
   - `wiki.ts` `findBacklinks()` — uses a one-off regex to test if a specific slug is linked
   - `lifecycle.ts` `stripBacklinksTo()` — uses a similar regex to strip links to a specific slug

3. **The wiki link regex** `/\[([^\]]*)\]\(([^)]+)\.md\)/g` appears in slightly different forms across the three files.

This duplication was flagged in the assessment as a code quality issue. Per learnings.md, parallel implementations of the same pattern drift over time.

## Implementation

### Create `src/lib/links.ts`

```typescript
/**
 * Shared utilities for wiki link parsing and regex escaping.
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
```

### Update `src/lib/wiki.ts`

- Remove `escapeRegExp` (line 11)
- Import `{ escapeRegex, hasLinkTo }` from `./links`
- In `findBacklinks()` (line ~523): replace the inline `escapeRegExp` + regex test with `hasLinkTo(wikiPage.content, targetSlug)`

### Update `src/lib/lifecycle.ts`

- Remove `const escapeRegex = ...` (line 75)
- Import `{ escapeRegex }` from `./links`
- The `stripBacklinksTo` function still needs its own regex for replacement (not just detection), so it keeps the inline `new RegExp(...)` but uses the imported `escapeRegex` for the slug

### Update `src/lib/lint.ts`

- Remove the local `extractWikiLinks` function (lines 97-104)
- Import `{ extractWikiLinks }` from `./links`
- Update the `export { ... extractWikiLinks ... }` at line 534 — since `extractWikiLinks` is now imported, re-export it from `./links` or keep exporting the import

### Update tests

- `src/lib/__tests__/lint.test.ts` — if it imports `extractWikiLinks` from `../lint`, update the import path (or verify lint.ts still re-exports it)
- Existing tests for `findBacklinks` in `wiki.test.ts` cover the `hasLinkTo` path implicitly

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All 543 tests must pass. No new tests needed — existing tests cover all three call sites. The key risk is import path changes breaking the build.
