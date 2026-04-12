Title: Fix lifecycle TOCTOU race, graph error handling, and empty query guard
Files: src/lib/lifecycle.ts, src/app/wiki/graph/page.tsx, src/lib/query.ts
Issue: none

## Description

Fix three bugs identified in the assessment. Each is small and independently testable.

### Bug 1: lifecycle.ts TOCTOU race (lines 195-214)

The `listWikiPages()` call on line 198 reads the index *outside* of any lock, then mutates the returned array and writes it back via `updateIndex()`. If two lifecycle ops run concurrently, the second one's `listWikiPages()` might read a stale index before the first one's `updateIndex()` completes, clobbering the first write.

**Fix**: Move the index read + mutate + write into a single `withFileLock("index.md", async () => { ... })` block. The `updateIndex` function already uses `withFileLock` internally, so we need to either:
- Remove the internal lock in `updateIndex` and let the caller hold it, OR
- Create a new `updateIndexUnsafe` (no lock) variant that `runPageLifecycleOp` calls while holding the lock itself

The second approach is safer — keeps `updateIndex` safe for direct callers.

Also fix line 224 which has the same issue (a second `listWikiPages()` call for cross-refs).

### Bug 2: lifecycle.ts misleading "fire-and-forget" comment (line 181)

The comment says "fire-and-forget" but the code uses `await`. Fix the comment to accurately describe the behavior: "blocking but failure-tolerant" or similar.

### Bug 3: graph page missing `r.ok` check (line 96)

```tsx
fetch("/api/wiki/graph")
  .then((r) => r.json())
```

If the API returns a non-200 response, `.json()` will either fail with an opaque parse error or succeed with an error object the code doesn't expect.

**Fix**: Add an `r.ok` check before calling `.json()`:
```tsx
fetch("/api/wiki/graph")
  .then((r) => {
    if (!r.ok) throw new Error(`Graph API error: ${r.status}`);
    return r.json();
  })
```

### Bug 4: Empty query guard in searchIndex (query.ts)

`searchIndex("")` currently runs the full BM25 pipeline with an empty query, producing meaningless zero-scores. Add an early return for empty/whitespace queries.

**Verification**: `pnpm build && pnpm lint && pnpm test` — ensure all existing tests pass. Add a test for the empty query guard if feasible.
