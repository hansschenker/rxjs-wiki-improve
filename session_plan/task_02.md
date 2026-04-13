Title: Fix cross-ref false positives and backlink-stripping orphaned commas
Files: src/lib/wiki.ts, src/lib/lifecycle.ts, src/lib/__tests__/wiki.test.ts
Issue: none

Two bugs in the core wiki write pipeline that cause incorrect cross-references:

## 1. `updateRelatedPages` uses `content.includes()` instead of `hasLinkTo()`

In wiki.ts, `updateRelatedPages` checks if a page already links to the new page with:
```ts
if (page.content.includes(`${newSlug}.md`)) continue;
```

This false-positives when the slug appears in prose (e.g., a page discussing "neural-networks.md" as a filename would skip adding the actual wiki link). The correct utility `hasLinkTo()` from `links.ts` already exists and is used in `findBacklinks`, but not here.

Fix: Import `hasLinkTo` from `./links` and replace the `content.includes()` check:
```ts
import { hasLinkTo } from "./links";
// ...
if (hasLinkTo(page.content, newSlug)) continue;
```

Verify what `hasLinkTo` expects — it should match `[any text](slug.md)` patterns, which is exactly the semantic we want.

## 2. `stripBacklinksTo` leaves orphaned double commas

In lifecycle.ts, when removing a middle link from "See also: A, B, C", the link `B` is removed by regex, leaving "See also: A, , C". The existing cleanup only handles:
- Leading comma after "See also:"
- Trailing comma at end of line

Missing: consecutive commas mid-line.

Fix: Add a cleanup step after the link removal that collapses double (or triple) commas:
```ts
// e) Collapse orphaned commas: "A, , C" → "A, C"
updated = updated.replace(/,(\s*,)+/g, ",");
```

Place this BEFORE the trailing-comma cleanup (step c) so the pipeline is:
1. Strip links
2. Drop empty See-also lines
3. Fix leading comma
4. **Collapse orphaned commas** (new)
5. Fix trailing comma
6. Collapse blank lines

## Tests

In wiki.test.ts:
- Add a test for `updateRelatedPages` that has a page mentioning a slug in prose but without a proper wiki link — verify the cross-ref IS added (was previously skipped)
- In lifecycle tests (or add to wiki.test.ts), test `stripBacklinksTo` with a middle-link removal scenario: verify "A, B, C" → "A, C" when B is removed

Since `stripBacklinksTo` is a private function in lifecycle.ts, test it indirectly through `deleteWikiPage` or add a focused test by temporarily exporting it. Alternative: test via the `deleteWikiPage` integration path.

Verify: `pnpm build && pnpm lint && pnpm test`
