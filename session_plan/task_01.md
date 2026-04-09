Title: BM25 full-body indexing + fix SCHEMA.md stale gaps
Files: src/lib/query.ts, src/lib/__tests__/query.test.ts, SCHEMA.md
Issue: none

## Description

The current BM25 implementation in `searchIndex()` only tokenizes `title + summary`
from `IndexEntry` objects (line 101 of query.ts: `tokenize(\`${entry.title} ${entry.summary}\`)`).
This means query search completely misses content in the body of wiki pages. A page about
"transformer attention mechanisms" won't match a query about "self-attention" if those words
only appear in the body, not the title or summary.

### Changes to `src/lib/query.ts`

1. **Add a `buildFullBodyCorpusStats` function** (or extend `buildCorpusStats` with an option)
   that reads the full page content for each entry. This needs to call `readWikiPage()` for
   each slug, then tokenize the full content (title + body) instead of just title + summary.

2. **Update `searchIndex()`** to use the full-body corpus stats. The function currently takes
   `IndexEntry[]` — it should additionally read full page bodies. Two approaches:
   - Option A: Add an optional parameter like `fullBody?: boolean` to `searchIndex` that
     triggers reading pages. Default to true.
   - Option B: Create a new `searchFullBody()` that `searchIndex` calls internally.
   
   Recommended: Option A. When `fullBody` is true (default), for each entry, read the page
   via `readWikiPage(entry.slug)` and use the full content for tokenization. Fall back to
   title+summary if the page can't be read.

3. **Keep `buildCorpusStats` exported as-is** for backward compatibility with tests, but
   add a new overload or sibling function for full-body stats.

4. **Performance note**: Reading all pages for BM25 is fine for the current scale (wikis with
   tens to low hundreds of pages). This is explicitly a bridge until vector search arrives.
   Add a comment noting this.

### Changes to `src/lib/__tests__/query.test.ts`

Add tests that verify:
- Full-body search finds terms that only appear in page bodies (not in title/summary)
- Full-body search still works when a page can't be read (graceful fallback)
- Existing BM25 tests still pass (backward compat for `buildCorpusStats`)

### Changes to `SCHEMA.md`

Fix the stale known-gaps section (lines 155-170):
1. **Remove** "No streaming LLM responses" — this is implemented (`callLLMStream` + `/api/query/stream`)
2. **Update** the BM25 gap: change "indexes title and summary only" to note that BM25 now
   indexes full page body content
3. Keep all other gaps as-is

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```
