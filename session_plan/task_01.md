Title: Index-first query — search relevant pages instead of loading all
Files: src/lib/query.ts, src/lib/__tests__/query.test.ts
Issue: none

## Problem

`query.ts` loads ALL wiki pages into the LLM context via `buildContext()`. This will hit token limits as the wiki grows. The founding vision (llm-wiki.md) explicitly describes the correct approach: "the LLM reads the index first to find relevant pages, then drills into them."

## Implementation

### 1. Add a `searchIndex` function to `query.ts`

Create a function that takes the question and the index entries, and returns the most relevant slugs. Two-phase approach:

**Phase 1 — keyword matching (always runs):**
- Tokenize the question into meaningful words (lowercase, strip stop words like "the", "is", "a", "what", "how", "which", "does", etc.)
- For each index entry, score it by how many question keywords appear in the title + summary (case-insensitive)
- Sort by score descending

**Phase 2 — if LLM is available, use it for smart selection:**
- Send the index.md content + the question to the LLM with a system prompt asking it to return a JSON array of the most relevant slugs (max 10)
- Parse the JSON response
- Fall back to keyword results if LLM call fails

### 2. Modify `buildContext` to accept a slug filter

Change signature to `buildContext(slugs?: string[])`. When slugs are provided, only load those pages. When not provided (empty wiki edge case), load nothing.

### 3. Update `query()` flow

```
1. Load index entries via listWikiPages()
2. If <= 5 pages total, load all (small wiki, no need to filter)
3. If > 5 pages, run searchIndex to find top-N relevant pages (N=10 max)
4. Build context from only the relevant pages
5. Include the full index listing in the system prompt so the LLM knows what else exists
6. Rest of flow unchanged
```

### 4. Create `src/lib/__tests__/query.test.ts`

Test the new `searchIndex` function:
- Returns matching slugs when question keywords match index entries
- Returns empty array when nothing matches
- Handles empty index
- With no LLM key, falls back to keyword matching
- `buildContext` with slug filter only loads specified pages
- `query()` returns empty-wiki message when no pages exist (existing behavior)
- `query()` returns no-api-key message when no key configured (existing behavior)

Export `searchIndex` and `buildContext` for testing. Mock `callLLM` and filesystem as in other test files.

### Verification

```bash
pnpm build && pnpm lint && pnpm test
```

All existing tests must continue to pass. New query tests must pass.
