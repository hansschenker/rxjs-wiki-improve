Title: Fix streaming vs non-streaming source semantics inconsistency
Files: src/app/query/page.tsx, src/lib/__tests__/query.test.ts
Issue: none

## Description

The assessment identified a semantic inconsistency between streaming and non-streaming query
paths (gap #10, bug #3):

- **Non-streaming** (`POST /api/query`): Returns `sources` = only pages actually *cited* in
  the answer (via `extractCitedSlugs()` which scans for `](slug.md)` patterns)
- **Streaming** (`POST /api/query/stream`): Returns `sources` = all pages *loaded into context*
  (via `X-Wiki-Sources` header containing `loadedSlugs`)

This means the "Sources" section below the answer shows different things depending on which
path ran. Streaming shows 5-10 context pages; non-streaming shows only 1-3 actually-cited
pages. The streaming sources are misleading — they include pages the LLM read but didn't
actually use in the answer.

### Fix: Client-side citation extraction after stream completes

The `extractCitedSlugs` logic is simple: scan for `](slug.md)` patterns in the answer text.
This can be replicated on the client side without importing server code.

In `src/app/query/page.tsx`:

1. **Add a `extractCitedSources` helper function** at the top of the file:
   ```ts
   function extractCitedSources(answer: string, availableSlugs: string[]): string[] {
     const pattern = /\]\(([^)]+?)\.md\)/g;
     const cited = new Set<string>();
     let match: RegExpExecArray | null;
     while ((match = pattern.exec(answer)) !== null) {
       const slug = match[1];
       if (availableSlugs.includes(slug)) {
         cited.add(slug);
       }
     }
     return Array.from(cited);
   }
   ```

2. **After the streaming loop completes** (around line 99), refine the sources list:
   ```ts
   // Refine sources to only those actually cited in the answer
   const citedSources = extractCitedSources(answer, sources);
   // Fall back to loaded sources if no citations detected (defensive)
   const finalSources = citedSources.length > 0 ? citedSources : sources;
   setResult({ answer, sources: finalSources });
   ```

3. **During streaming** (line 95), continue showing the loaded sources as-is since the
   answer is incomplete. Only refine after streaming is done.

### Test additions in `src/lib/__tests__/query.test.ts`

Add a focused test for `extractCitedSlugs` behavior (it's currently a private function in
query.ts, but the test can verify the behavior indirectly through the `query()` function's
returned sources). If extractCitedSlugs is already well-tested, no new tests needed — just
verify the existing tests still pass.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

The change is UI-only (client-side extraction). No API changes needed.
