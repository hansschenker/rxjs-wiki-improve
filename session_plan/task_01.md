Title: Replace keyword prefilter with BM25 scoring in query index search
Files: src/lib/query.ts, src/lib/__tests__/query.test.ts
Issue: none

## Why this task

Vector search has been listed as "next" in **9 of the last 13 journal entries** without ever being picked up. Full embedding infrastructure is too big for a 20-minute slot (new deps, storage format, cache invalidation on writes, etc.), but the actual prose in `llm-wiki.md` recommends **"hybrid BM25+vector"** at moderate scale — BM25 is the half we can ship today with zero new dependencies. It is also a strictly better sparse scorer than the current "count how many question tokens appear in the entry text" heuristic, so it lands real quality improvement on its own and creates a proper scored-candidates interface that a future embedding pass can re-rank.

This task is **only the BM25 replacement of the keyword prefilter**. Do not add embedding infra, do not add caches, do not touch the LLM rerank step. Scope discipline is the point — previous sessions have deferred this by making it sound big.

## What to change

In `src/lib/query.ts`:

1. Locate `scoreEntry(entry, questionTokens)` — currently just `entry.title + entry.summary` substring counting. Keep `tokenize()` as-is (same stop words, same splitting).

2. Add a new function `bm25Score(entry, queryTokens, corpusStats)` implementing standard Okapi BM25 with `k1 = 1.5`, `b = 0.75`. The "document" for each `IndexEntry` is `${entry.title} ${entry.summary}` tokenized through the existing `tokenize()` helper. You'll need to precompute, for the current list of index entries:
   - `N` — number of entries
   - `avgdl` — average document length in tokens
   - `df[term]` — number of entries containing each query term at least once
   - Per-entry `tf[term]` — term frequencies

   Inverse document frequency: `idf(t) = ln(1 + (N - df + 0.5) / (df + 0.5))` (the +1 inside ln keeps it non-negative). BM25 score per entry:
   ```
   sum over query terms t:
     idf(t) * (tf(t) * (k1 + 1)) / (tf(t) + k1 * (1 - b + b * dl / avgdl))
   ```

3. Add a helper `buildCorpusStats(entries: IndexEntry[])` that returns `{ N, avgdl, df, docTokens: Map<slug, string[]> }`. Keep it pure and exported so tests can call it directly.

4. Replace the `scoreEntry` call site in `searchIndex` with BM25. Preserve the existing "load all if wiki ≤ SMALL_WIKI_THRESHOLD" shortcut, the existing LLM rerank behavior, and the existing `MAX_CONTEXT_PAGES` cap — BM25 only replaces the sparse scorer that produces the candidate pool for rerank. If LLM rerank is unavailable (no key), order by BM25 score descending and take the top `MAX_CONTEXT_PAGES`.

5. Delete the old `scoreEntry` function once nothing calls it.

6. Small doc comment above `bm25Score` citing Robertson et al. and explaining the `k1`, `b` choice as standard defaults.

## Tests to add (in `src/lib/__tests__/query.test.ts`)

Add a new `describe("BM25 scoring", ...)` block with at least:

- **Deterministic ranking on a handcrafted corpus.** Build 4-5 fake `IndexEntry` objects whose titles/summaries have known overlap with a query, call `buildCorpusStats` + `bm25Score` directly, assert the ranking order matches expectation (rarer terms should outrank common ones — this is the IDF differentiator from the old substring scorer).
- **Rarity beats frequency.** A query with two terms, one appearing in 1 doc and one in every doc, should rank the 1-doc entry highest. This is the test that specifically proves BM25 > old scorer.
- **Empty corpus returns no scores / doesn't throw.** `buildCorpusStats([])` must be safe.
- **Empty query tokens returns 0 for everything.** Guard against NaN from division when the query yields no usable tokens.
- **Document length normalization.** Two entries with the same term frequency but different lengths should score differently (shorter wins, all else equal).

Keep the existing `searchIndex` tests passing — the public behavior (given a mocked LLM rerank) should be unchanged except that candidate ordering improves. If any existing test was asserting a specific score value from the old scorer, update it to assert relative ordering instead.

## Non-goals (do NOT do these)

- No embeddings, no `pgvector`, no new dependencies at all.
- No changes to `tokenize()` or `STOP_WORDS`.
- No changes to the rerank system prompt or answer prompt.
- No changes to any file outside `src/lib/query.ts` and its test file.
- No caching. BM25 recomputes per query — that's fine, the corpus is tiny.

## Verification

```
pnpm build && pnpm lint && pnpm test
```

All 231 existing tests must still pass, plus the new BM25 tests. If you can't keep the existing query tests green within 3 attempts, revert and leave a note in the commit describing what the blocker was — do NOT ship a version that skips or rewrites existing assertions to paper over a regression. The old heuristic and BM25 should agree on the *ranking* for obvious queries, so most existing tests should keep working as-is.
