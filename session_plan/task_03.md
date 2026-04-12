Title: Add per-operation page cache to reduce redundant filesystem reads
Files: src/lib/wiki.ts, src/lib/__tests__/wiki.test.ts
Issue: none

## Description

Add a request-scoped page cache to eliminate redundant filesystem reads. This is gap #1 from the assessment — the single biggest systemic issue: "`listWikiPages()`, `buildCorpusStats()`, lint checks, and lifecycle ops all independently re-read every page from disk. A single query touches the filesystem dozens of times reading the same files."

### Design

Use a simple module-level `Map<string, WikiPage | null>` cache with explicit `beginPageCache()` / `endPageCache()` lifecycle functions. When active, `readWikiPage()` checks the cache before hitting disk and stores results. `writeWikiPage()` invalidates its cache entry. Callers wrap operations in `withPageCache(fn)` for automatic cleanup.

### Implementation steps

1. **`src/lib/wiki.ts`** — Add caching layer:

   ```ts
   // Module-level cache state
   let pageCache: Map<string, WikiPage | null> | null = null;

   /** Enable per-operation page caching. Returns a cleanup function. */
   export function beginPageCache(): () => void {
     pageCache = new Map();
     return () => { pageCache = null; };
   }

   /** Convenience wrapper: run fn with caching enabled, clean up after. */
   export async function withPageCache<T>(fn: () => Promise<T>): Promise<T> {
     const cleanup = beginPageCache();
     try {
       return await fn();
     } finally {
       cleanup();
     }
   }

   // For testing: expose cache stats
   export function _getPageCacheSize(): number {
     return pageCache?.size ?? 0;
   }
   ```

   - Modify `readWikiPage()`: at the top, if `pageCache` is not null, check for `slug` key. If found, return cached value. If not found, proceed with disk read, then store result in cache before returning.
   - Modify `writeWikiPage()`: after writing to disk, if `pageCache` is not null, delete the slug from cache (invalidate, not update — next read will get fresh data).

2. **Wire cache into hot paths** — Add `withPageCache` wrapping in these callers:
   - `src/lib/lint.ts` → wrap the `lint()` function body (reads every page multiple times across 6+ checks)
   - `src/lib/query.ts` → wrap the `query()` function body (reads pages for BM25 scoring then again for context building)

   **However**, to keep this task to ≤5 files, only modify `wiki.ts` and its test file. The callers (`lint.ts`, `query.ts`) will be wired in a follow-up. The cache is opt-in and zero-impact when not activated.

3. **`src/lib/__tests__/wiki.test.ts`** — Add tests:
   - `readWikiPage` returns cached result when cache is active (write a page, read it, modify file directly on disk, read again — should get cached version)
   - `writeWikiPage` invalidates cache entry (write page, read to cache, write again via `writeWikiPage`, read — should get new content)
   - `withPageCache` cleans up after normal completion
   - `withPageCache` cleans up after error (fn throws)
   - Cache is inactive by default (`readWikiPage` always reads disk when no `beginPageCache`)
   - `_getPageCacheSize` returns 0 when cache not active

### Verification
```
pnpm build && pnpm lint && pnpm test
```
