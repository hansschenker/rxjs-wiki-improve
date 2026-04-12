# Assessment — 2026-04-12

## Build Status
✅ PASS — `pnpm build` compiles 28 routes with zero type errors. `pnpm test` passes 504 tests across 12 test files in 3.9s.

## Project State
All four founding vision pillars are fully implemented (session 20 status report confirms this):

**Ingest** — URL fetch (Readability + linkedom), text paste, batch multi-URL, content chunking for long docs, human-in-the-loop preview mode, raw source persistence. 652 lines in `ingest.ts`.

**Query** — BM25 full-body scoring + optional vector search (RRF fusion with embeddings for OpenAI/Google/Ollama providers), streaming responses via `/api/query/stream`, citation extraction, save-answer-to-wiki loop, query history persistence. 542 lines in `query.ts`.

**Lint** — 6 checks (orphan-page, stale-index, empty-page, missing-crossref, contradiction, missing-concept-page), all with LLM-powered auto-fix via `/api/lint/fix`. Contradiction and missing-concept-page checks run in parallel. 543 lines in `lint.ts`, 390 in `lint-fix.ts`.

**Browse** — Wiki index with search/filter/tags, individual page view with backlinks section, edit/delete/create flows, interactive D3 force-directed graph, log viewer, raw source browser, global full-text search in NavHeader, Obsidian export (zip with wikilinks).

**Infrastructure** — Multi-provider LLM via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama), settings UI for provider/model/API key config (persisted JSON), file locking for concurrent ops, exponential backoff retry on LLM calls, error boundaries on all routes, status endpoint.

## Recent Changes (last 3 sessions)

1. **Session 21 (2026-04-12 08:21)** — Parallelized lint LLM checks (contradiction + missing-concept-page run concurrently), extracted shared JSON response parser, fixed lifecycle TOCTOU race (slug existence check vs write), hardened graph error handling, added empty-query guard.

2. **Session 20 (2026-04-12 05:50)** — Added missing-concept-page lint check (detects concepts mentioned across pages but lacking their own page), LLM auto-fix that generates stub pages, consolidated 5 duplicate error boundary components into shared `PageError`.

3. **Session 19 (2026-04-12 01:56)** — Query history persistence, upgraded GlobalSearch from title-only to full-text content search, extracted shared `slugify.ts` utility from duplicated logic in wiki.ts/ingest.ts.

## Source Architecture

**Total: ~18,200 lines** (10,770 production, 7,420 tests)

```
src/lib/           (14 modules, ~4,960 lines production)
  ingest.ts          652   URL fetch, HTML cleanup, LLM page generation, chunking
  wiki.ts            585   Filesystem ops, index, log, search, backlinks
  lint.ts            543   6 lint checks incl. LLM contradiction detection
  query.ts           542   BM25, vector search, RRF fusion, LLM synthesis
  embeddings.ts      447   Provider-agnostic vector store, cosine similarity
  lint-fix.ts        390   Auto-fix handlers for all lint issue types
  config.ts          353   Config store (JSON persistence, env var fallback)
  lifecycle.ts       333   Write/delete pipeline (index, log, embeddings, cross-refs)
  llm.ts             314   LLM abstraction (retry, streaming, provider detection)
  frontmatter.ts     267   YAML frontmatter parse/serialize
  query-history.ts   129   Query history persistence
  raw.ts             125   Raw source CRUD
  + 5 small modules  ~240  (types, constants, citations, slugify, lock, export, providers)

src/lib/__tests__/ (12 test files, ~7,420 lines, 504 tests)

src/app/           (7 pages + 14 API routes with 28 handlers, ~4,300 lines)
  page.tsx            95   Home dashboard with empty-state onboarding
  ingest/page.tsx    513   Ingest form with batch + preview
  query/page.tsx     505   Query with streaming + history
  lint/page.tsx      327   Lint dashboard with auto-fix
  settings/page.tsx  616   Provider/model/API key config
  wiki/              ...   Index, slug view, edit, new, graph, log
  raw/               ...   Raw source index + detail view
  api/               ...   14 route files

src/components/    (9 components, ~1,470 lines)
  GlobalSearch.tsx   339   Full-text search in nav
  BatchIngestForm    316   Multi-URL ingest
  WikiIndexClient    249   Filterable wiki index
  NavHeader.tsx      215   App navigation (desktop + mobile)
  + 5 smaller        ~350  (WikiEditor, MarkdownRenderer, StatusBadge, etc.)
```

## Open Issues Summary
No open issues on GitHub (`gh issue list` returns empty array).

## Gaps & Opportunities

### High-impact gaps (founding vision alignment)

1. **No page-read caching** — The single biggest systemic issue. `listWikiPages()`, `buildCorpusStats()`, lint checks, and lifecycle ops all independently re-read every page from disk. A single query touches the filesystem dozens of times reading the same files. For a wiki beyond ~50 pages, this becomes a real performance bottleneck. A per-request or per-operation page cache would dramatically reduce I/O.

2. **Broken link lint check missing** — Lint detects orphan pages, stale index entries, and missing cross-refs, but doesn't check for **broken links** (references to `slug.md` where no such file exists). This is table-stakes for wiki health and explicitly part of the founding vision's lint concept.

3. **Graph view clustering** — Mentioned as "next" in 8+ consecutive journal entries but never built. The D3 graph view works but becomes unusable at scale. Clustering by topic/tag would make it valuable for larger wikis. This is the longest-deferred item in the project.

4. **SSRF protection on URL ingest** — `isUrl()` only checks for `http://` prefix. No protection against fetching internal/private IPs. A user (or attacker) could point the ingest at `http://169.254.169.254/` (cloud metadata) or internal network resources.

### Medium-impact gaps

5. **Delete backlink-stripping has no file lock** — Two concurrent deletes can clobber each other's page rewrites. The write path has locking; the delete path doesn't.

6. **NavHeader link rendering duplication** — Desktop and mobile nav links are copy-pasted with minor class differences. A `NavLink` component would cut ~50 lines.

7. **No rollback on partial lifecycle failure** — If page write succeeds but index update fails, you get an orphan page with no index entry. No compensation logic exists.

8. **Query does full BM25 computation then throws it away when LLM selection is available** — When an LLM key exists, `selectPagesForQuery` computes BM25 scores for all pages, then the LLM re-ranker ignores them entirely and picks its own pages. The BM25 work is wasted.

### Lower-impact / deferred

9. **Image/asset handling during ingest** — Images in source HTML are dropped. Founding vision mentions downloading images locally.
10. **Duplicate index entry detection** — No lint check for same slug appearing twice in index.md.
11. **CLI tool for headless operations** — Founding vision mentions CLI alongside web app.
12. **`findBacklinks` regex injection** — Slug isn't escaped in regex construction; defense-in-depth issue (validator prevents dangerous chars but escaping is the correct fix).

## Bugs / Friction Found

1. **Multi-chunk ingest context growth** — Each continuation LLM call includes the entire accumulated wiki content plus the next chunk. For documents split into 5+ chunks, later calls could exceed context window limits despite per-chunk size guards. No total-size cap.

2. **`checkMissingCrossRefs` false positives** — Word-boundary matching with a 3-char minimum means common English words that happen to be page titles (e.g., "Loss", "Data", "Time") generate spurious missing-crossref warnings on every mention.

3. **`checkMissingConceptPages` visibility** — Truncates to 20 pages at 500 chars each, meaning for a 100-page wiki, 80% of content is invisible to the concept gap detector.

4. **Home page has no error boundary** — If `listWikiPages()` throws (e.g., corrupted index.md), the entire home page returns a 500.

5. **`saveAnswerToWiki` slug collision** — If two saved answers produce the same slugified title, the second silently overwrites the first with no conflict detection.
