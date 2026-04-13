Title: Performance — findBacklinks cache + query double-read elimination
Files: src/lib/wiki.ts, src/lib/query.ts, src/lib/__tests__/wiki.test.ts, src/lib/__tests__/query.test.ts
Issue: none

## Problem

Two performance issues flagged in the assessment:

### 1. `findBacklinks` bypasses page cache (wiki.ts:518-534)

`findBacklinks` reads every wiki page from disk individually via `readWikiPage()` but doesn't use `withPageCache`. This means every call to view a wiki page triggers a full disk scan of all pages. The lint module already demonstrates the pattern — it wraps its full-scan operations in `withPageCache` for a single load.

**Fix:** Wrap the `findBacklinks` body in `withPageCache(async () => { ... })` so all `readWikiPage` calls inside benefit from the in-memory cache. This is a ~3 line change.

### 2. Redundant disk reads in query (query.ts)

`searchIndex` calls `buildCorpusStats(entries)` which reads every page from disk to build BM25 scores. Then `buildContext(selectedSlugs)` reads the selected pages again from disk. The first scan is unavoidable (need corpus stats for ranking), but the pages loaded during corpus stats building could be reused during context building.

**Fix:** Have `buildCorpusStats` optionally return the loaded page contents alongside stats. Then `searchIndex` can return both the ranked slugs AND the already-loaded page map. `buildContext` can accept an optional pre-loaded page map and skip disk reads for pages already in memory.

Alternatively (simpler): wrap the entire `query()` function body in `withPageCache` so all `readWikiPage` calls within a single query share an in-memory cache. This avoids changing any function signatures.

**Prefer the simpler approach** — wrapping `query()` in `withPageCache`. This is ~3 lines of change in query.ts and gives the same benefit without API changes.

## Verification

- `pnpm build && pnpm lint && pnpm test`
- Add a test in wiki.test.ts that verifies `findBacklinks` still returns correct results (may already exist)
- Existing query tests should continue passing since the cache is transparent
