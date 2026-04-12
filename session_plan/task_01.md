Title: Fix fromCharCode bug in ingest.ts and deduplicate link regex in lint.ts
Files: src/lib/ingest.ts, src/lib/lint.ts, src/lib/__tests__/ingest.test.ts, src/lib/__tests__/lint.test.ts
Issue: none

## Bug 1: `String.fromCharCode` → `String.fromCodePoint` in ingest.ts

In `stripHtml()` (~line 87-88), numeric HTML entity decoding uses `String.fromCharCode()`:
```ts
.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
```

`fromCharCode` only handles BMP characters (0–0xFFFF). Astral Unicode (emoji like `&#128512;` = 😀, CJK extensions) produces garbage. Fix: replace both calls with `String.fromCodePoint()` which handles the full Unicode range.

**Add a test** in `ingest.test.ts` that verifies `stripHtml('&#128512;')` returns `😀` and `stripHtml('&#x1F600;')` returns `😀`.

## Bug 2: Deduplicate link regex in lint.ts

The regex `/\[([^\]]*)\]\(([^)]+)\.md\)/g` appears identically on lines 105, 145, and 185 of `lint.ts`. Line 185 is inside `extractCrossRefSlugs()` which is already a dedicated extractor function. However, lines 105 (`checkBrokenLinks`) and 145 (`checkMissingCrossRefs`) need more than just slugs — they need the match object for link text and target.

Fix approach:
1. Extract a module-level constant for the regex _pattern_ (not a `g`-flag regex, since `g`-flag regexes are stateful): `const WIKI_LINK_PATTERN = /\[([^\]]*)\]\(([^)]+)\.md\)/g;` won't work as a shared constant because of `lastIndex` state. Instead, create a helper function:
   ```ts
   function extractWikiLinks(content: string): Array<{ text: string; targetSlug: string }> {
     const results: Array<{ text: string; targetSlug: string }> = [];
     const re = /\[([^\]]*)\]\(([^)]+)\.md\)/g;
     let match;
     while ((match = re.exec(content)) !== null) {
       results.push({ text: match[1], targetSlug: match[2] });
     }
     return results;
   }
   ```
2. Refactor `checkBrokenLinks` (line ~103) to use `extractWikiLinks()` instead of inline regex
3. Refactor `checkMissingCrossRefs` (line ~143) to use `extractWikiLinks()` instead of inline regex  
4. Refactor `extractCrossRefSlugs` (line ~184) to use `extractWikiLinks()` and map to slugs
5. Export `extractWikiLinks` for testing

**Add a test** in `lint.test.ts` for `extractWikiLinks` that covers edge cases (no links, multiple links, links with special chars in text).

## Verification
```sh
pnpm build && pnpm lint && pnpm test
```
