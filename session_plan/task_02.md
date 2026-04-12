Title: Add page cache to lint for ~5x fewer disk reads
Files: src/lib/lint.ts, src/lib/__tests__/lint.test.ts
Issue: none

## Problem

`lint()` runs 7 checks, 5 of which independently read every wiki page from disk:

- `checkEmptyPages` — reads every page via `readWikiPage(slug)` 
- `checkBrokenLinks` — reads every page via `readWikiPage(slug)`
- `checkMissingCrossRefs` — reads every page via `readWikiPage(slug)`
- `checkContradictions` — reads every page via `readWikiPage(slug)`
- `checkMissingConceptPages` — reads every page via `readWikiPage(slug)`

For a wiki with N pages, that's ~5N disk reads when N would suffice. The codebase already has `withPageCache` / `beginPageCache` in `wiki.ts` (added in session 19) which provides a per-operation in-memory cache for `readWikiPage` — lint just never adopted it.

## Fix

1. **Wrap the entire `lint()` function body in `withPageCache()`** so that all reads within a single lint run hit the cache after first access.

2. The change is minimal — `withPageCache` is an async wrapper that calls `beginPageCache()` before executing, and automatically clears the cache when done. All the internal check functions will transparently benefit because they call `readWikiPage()`, which checks the cache.

Specific code change in `lint.ts`:
```ts
import { ..., withPageCache } from "./wiki";

export async function lint(): Promise<LintResult> {
  return withPageCache(async () => {
    // existing lint body unchanged
    ...
  });
}
```

3. **Add a test** that verifies the cache is active during lint. Use `_getPageCacheSize()` or mock `readWikiPage` to count disk reads and verify they're ≤ N (not 5N).

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Check that all existing lint tests still pass (the cache is transparent to callers). The new test should verify cache behavior.
