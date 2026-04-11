Title: Centralize scattered tuning constants into shared module
Files: src/lib/constants.ts, src/lib/ingest.ts, src/lib/query.ts, src/components/BatchIngestForm.tsx, src/app/api/ingest/batch/route.ts
Issue: none

## Description

Tuning constants are scattered across modules and in some cases duplicated. Create a single `src/lib/constants.ts` that exports all shared constants, then update consumers to import from it.

### Constants to centralize

From `src/lib/ingest.ts`:
- `MAX_RESPONSE_SIZE = 5 * 1024 * 1024` (5MB fetch limit)
- `MAX_CONTENT_LENGTH = 100_000` (100K char content cap)
- `FETCH_TIMEOUT_MS = 15_000` (15s URL fetch timeout)
- `MAX_LLM_INPUT_CHARS = 12_000` (chunk size for LLM input)

From `src/lib/query.ts`:
- `MAX_CONTEXT_PAGES = 10`
- `BM25_K1 = 1.5`
- `BM25_B = 0.75`
- `RRF_K = 60`

**Duplicated** between client and server:
- `MAX_URLS = 20` in `src/components/BatchIngestForm.tsx`
- `MAX_BATCH_SIZE = 20` in `src/app/api/ingest/batch/route.ts`
  → Consolidate into `MAX_BATCH_URLS = 20` in constants.ts

### Implementation

1. Create `src/lib/constants.ts` with all the above constants, organized into sections with JSDoc comments explaining what each controls.

2. Update `src/lib/ingest.ts` to import `MAX_RESPONSE_SIZE`, `MAX_CONTENT_LENGTH`, `FETCH_TIMEOUT_MS`, `MAX_LLM_INPUT_CHARS` from constants. Remove the local declarations but keep the re-export of `MAX_LLM_INPUT_CHARS` (it's used by tests).

3. Update `src/lib/query.ts` to import `MAX_CONTEXT_PAGES`, `BM25_K1`, `BM25_B`, `RRF_K` from constants. Remove local declarations.

4. Update `src/components/BatchIngestForm.tsx` to import `MAX_BATCH_URLS` from constants. Replace `MAX_URLS` usage.

5. Update `src/app/api/ingest/batch/route.ts` to import `MAX_BATCH_URLS` from constants. Replace `MAX_BATCH_SIZE` usage.

### Important notes
- `MAX_LLM_INPUT_CHARS` is currently `export`ed from ingest.ts and imported by tests. After moving to constants.ts, update the re-export in ingest.ts OR update the test import. Check: `grep -rn "MAX_LLM_INPUT_CHARS" src/` to find all consumers.
- `chunkText` function in ingest.ts uses `MAX_LLM_INPUT_CHARS` as a default parameter — update to import from constants.
- BM25 params have inline doc comments in query.ts — move these comments to constants.ts.

## Verification
```
pnpm build && pnpm lint && pnpm test
```
This is a pure refactor — no behavior change. All existing tests should pass unchanged (they test the same values through the same public APIs).
