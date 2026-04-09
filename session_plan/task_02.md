Title: Deduplicate BM25 corpus stats and extract shared citation parser
Files: src/lib/query.ts, src/app/query/page.tsx, src/lib/__tests__/query.test.ts
Issue: none

## Problem

Two instances of code duplication identified in the assessment:

### 1. `buildCorpusStats` and `buildFullBodyCorpusStats` are ~90% identical

Both functions in `query.ts` (lines 95-167) share the exact same structure:
- Initialize `docTokens`, `df`, `totalLen`
- Loop over entries, tokenize, accumulate stats
- Compute `N` and `avgdl`

The ONLY difference is how `text` is built:
- `buildCorpusStats`: `text = entry.title + " " + entry.summary` (sync)
- `buildFullBodyCorpusStats`: reads page from disk, uses full body, falls back to title+summary (async)

### Fix

Merge into a single async function with a `fullBody?: boolean` parameter (defaulting to `true` since that's the production path). The index-only variant is only used in tests; could be kept as a thin sync wrapper or removed if tests can use the async version.

Concrete approach:
```ts
export async function buildCorpusStats(
  entries: IndexEntry[],
  opts?: { fullBody?: boolean },
): Promise<CorpusStats> {
  const useFullBody = opts?.fullBody ?? true;
  // ... shared loop, conditionally read page if useFullBody
}
```

Update call sites:
- `selectPagesForQuery` (line 250): already passes `fullBody` flag, just change the call
- Tests: update to use `buildCorpusStats(entries, { fullBody: false })`

### 2. `extractCitedSlugs` duplicated client/server

`query.ts:339` exports `extractCitedSlugs`. `query/page.tsx:11` has a local `extractCitedSources` with identical logic. The client can't import from `src/lib/query.ts` because it pulls in server-only deps (fs, wiki).

### Fix

Extract `extractCitedSlugs` to a new tiny shared file `src/lib/citations.ts` (~15 lines) that has zero server dependencies. Both `query.ts` and `query/page.tsx` import from there.

Actually, simpler: the function is pure string manipulation with no imports. Move it to a file that both client and server can import. Create `src/lib/citations.ts`:

```ts
/**
 * Extract wiki slugs cited in markdown text via `](slug.md)` link patterns.
 * Pure string logic — safe for both client and server.
 */
export function extractCitedSlugs(answer: string, availableSlugs: string[]): string[] {
  const pattern = /\]\(([^)]+?)\.md\)/g;
  const cited = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(answer)) !== null) {
    const slug = match[1];
    if (availableSlugs.includes(slug)) cited.add(slug);
  }
  return Array.from(cited);
}
```

Then:
- `query.ts`: `import { extractCitedSlugs } from "./citations";` (remove local copy)
- `query/page.tsx`: `import { extractCitedSlugs } from "@/lib/citations";` (remove local `extractCitedSources`)

### Tests

- Existing `query.test.ts` tests for `buildCorpusStats` and `extractCitedSlugs` should continue to pass
- May need to update imports in tests if function signatures change
- Add a test that `buildCorpusStats` with `{ fullBody: false }` produces same results as old behavior

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Note: this is a pure refactor — no behavior changes, just deduplication. All existing tests must continue to pass.
