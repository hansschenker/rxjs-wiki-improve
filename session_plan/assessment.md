# Assessment — 2026-04-12

## Build Status
**✅ PASS** — `pnpm build` succeeds (28 routes), `pnpm test` passes (563 tests across 12 files), `pnpm lint` clean. Zero type errors. Only 2 suppressions in the whole codebase (one `@ts-expect-error` for testing, one `eslint-disable` for a D3 effect dependency).

## Project State
The project is mature and feature-complete relative to the founding vision. All four pillars are implemented end-to-end:

| Pillar | Routes | Key features |
|--------|--------|-------------|
| **Ingest** | `/ingest`, `/api/ingest`, `/api/ingest/batch` | URL fetch (Readability), text paste, batch multi-URL, content chunking, human-in-the-loop preview, raw source persistence |
| **Query** | `/query`, `/api/query`, `/api/query/stream`, `/api/query/save`, `/api/query/history` | BM25 + optional vector search (RRF), streaming responses, citations, save-to-wiki loop, query history |
| **Lint** | `/lint`, `/api/lint`, `/api/lint/fix` | 6 checks (orphan, stale-index, empty, missing-crossref, contradiction, missing-concept-page), all with LLM auto-fix |
| **Browse** | `/wiki`, `/wiki/[slug]`, `/wiki/[slug]/edit`, `/wiki/new`, `/wiki/graph`, `/wiki/log`, `/raw`, `/raw/[slug]` | Index with search/filter, page view with backlinks, CRUD, D3 graph, log viewer, raw source browser, global search, Obsidian export |

**Supporting infrastructure:** Settings UI with provider config persistence, multi-provider LLM (Anthropic, OpenAI, Google, Ollama), embedding layer with vector store, file locking, SSRF protection, mobile-responsive nav.

**Codebase size:** ~19,300 lines total (lib: 4,960, tests: 8,100, pages+routes: 4,800, components: 1,465).

## Recent Changes (last 3 sessions)
From git log + journal (sessions 19–21, all on 2026-04-12):

1. **Session 21 (16:30):** Extracted shared `links.ts` module, fixed `isRetryableError` false positives on LLM content, hardened SSRF protection (redirect re-validation, IPv4-mapped IPv6 blocking, streaming body size check).
2. **Session 20 (12:44):** Swept bare `catch` blocks → `catch (err: unknown)` with proper narrowing across 7 files. Fixed `findBacklinks` regex injection. Fixed `fromCharCode` misuse in HTML entity decoding. Deduplicated link-detection regex.
3. **Session 19 (08:41):** Added per-operation page cache (`withPageCache`). Hardened SSRF protection (private IP ranges, localhost, metadata endpoints). Added broken-link lint check with auto-fix.

**Pattern:** Last several sessions have been hardening/polish — no major features, focused on security, type safety, dedup, and performance.

## Source Architecture

```
src/
├── lib/                    (4,960 lines — core logic)
│   ├── ingest.ts           850 lines — URL fetch, HTML cleanup, LLM page gen, chunking
│   ├── wiki.ts             654 lines — filesystem ops, index, log, search, backlinks, page cache
│   ├── lint.ts             569 lines — 6 lint checks incl. LLM contradiction detection
│   ├── query.ts            545 lines — BM25, vector search, RRF fusion, LLM synthesis
│   ├── lint-fix.ts         452 lines — auto-fix handlers for all lint issue types
│   ├── embeddings.ts       449 lines — provider-agnostic vector store, cosine similarity
│   ├── config.ts           355 lines — settings persistence, env var fallback
│   ├── lifecycle.ts        331 lines — write/delete pipeline (index, log, embeddings, cross-refs)
│   ├── llm.ts              330 lines — multi-provider LLM calls with retry
│   ├── frontmatter.ts      267 lines — YAML frontmatter parse/serialize
│   ├── query-history.ts    129 lines — query history persistence
│   ├── raw.ts              125 lines — raw source storage
│   ├── constants.ts         72 lines — tuneable magic numbers
│   ├── types.ts             74 lines — shared interfaces
│   ├── lock.ts              61 lines — file locking
│   ├── providers.ts         46 lines — provider info/labels
│   ├── links.ts             44 lines — wiki link extraction
│   ├── export.ts            27 lines — Obsidian export
│   ├── citations.ts         21 lines — citation slug extraction
│   └── slugify.ts           18 lines — slug generation
│
├── lib/__tests__/          (8,110 lines — 563 tests across 12 files)
│   ├── wiki.test.ts       1,782 lines
│   ├── ingest.test.ts     1,610 lines
│   ├── query.test.ts      1,009 lines
│   ├── embeddings.test.ts   993 lines
│   ├── lint.test.ts         959 lines
│   ├── lint-fix.test.ts     656 lines
│   ├── llm.test.ts          432 lines
│   ├── config.test.ts       334 lines
│   ├── query-history.test.ts 202 lines
│   ├── export.test.ts        65 lines
│   ├── slugify.test.ts       50 lines
│   └── smoke.test.ts         18 lines
│
├── app/                    (4,800 lines — 7 pages, 14 API routes)
│   ├── page.tsx              95 lines — home/dashboard
│   ├── ingest/page.tsx      513 lines — ingest form + preview + result
│   ├── query/page.tsx       505 lines — query + history + streaming
│   ├── lint/page.tsx        348 lines — lint results + auto-fix
│   ├── settings/page.tsx    616 lines — provider config UI
│   ├── wiki/page.tsx         23 lines — wiki index (server)
│   ├── wiki/[slug]/page.tsx 139 lines — page view
│   ├── wiki/[slug]/edit/    44 lines — edit page
│   ├── wiki/new/page.tsx    142 lines — create page
│   ├── wiki/graph/page.tsx  445 lines — D3 force graph
│   ├── wiki/log/page.tsx     31 lines — activity log
│   ├── raw/page.tsx          88 lines — raw source index
│   ├── raw/[slug]/page.tsx   86 lines — raw source view
│   └── api/ (14 route files, 28 handlers)
│
└── components/             (1,465 lines — 9 components)
    ├── GlobalSearch.tsx     339 lines — full-text search combobox
    ├── BatchIngestForm.tsx  316 lines — multi-URL ingest form
    ├── WikiIndexClient.tsx  249 lines — client-side wiki index
    ├── NavHeader.tsx        215 lines — persistent navigation
    ├── WikiEditor.tsx        96 lines — page editor
    ├── StatusBadge.tsx       91 lines — provider status indicator
    ├── MarkdownRenderer.tsx  59 lines — markdown display
    ├── DeletePageButton.tsx  55 lines — delete confirmation
    └── ErrorBoundary.tsx     45 lines — shared error boundary
```

## Open Issues Summary
**No open issues** — `gh issue list` returns an empty array. Community input is currently absent.

## Gaps & Opportunities

### vs. YOYO.md Vision
- ✅ Ingest (URL + text + batch) — done
- ✅ Query (cited answers from wiki pages) — done
- ✅ Lint (health-check with auto-fix) — done
- ✅ Browse (index, cross-refs, graph view) — done
- ⚠️ **CLI tool** — mentioned as open question, not started
- ⚠️ **Obsidian plugin** — export exists, real plugin doesn't
- ⚠️ **Multi-user / auth** — not started
- ⚠️ **Image/asset handling** — images dropped during URL ingest

### vs. llm-wiki.md Founding Vision
- ⚠️ **Image handling** — "Download images locally... lets the LLM view and reference images" — not implemented
- ⚠️ **Marp slide decks** — mentioned as an answer format, not supported
- ⚠️ **Dataview-style queries** — frontmatter exists but no dynamic query/table views
- ⚠️ **Chart/canvas output** — mentioned as query output format, not supported

### Performance & Quality Gaps (from code review)
1. **`GlobalSearch.tsx` fires `fetchPages()` on every keystroke** — no debounce, causes redundant `/api/wiki` network requests per character typed
2. **`lint()` doesn't use `withPageCache`** — 3 separate lint checks each read every wiki page from disk independently (~3x redundant reads)
3. **`listWikiPages()` has no caching** — reads and parses `index.md` + all page frontmatter on every call; called by lifecycle, lint, backlinks, search
4. **`findBacklinks()` reads all pages twice** — once via `listWikiPages()` (frontmatter), then again via `readWikiPage()` (full content)
5. **Residual TOCTOU in `lifecycle.ts`** — `listWikiPages()` called outside file lock for cross-ref path; concurrent ingests can get stale data
6. **Large monolithic page components** — `settings/page.tsx` (616), `ingest/page.tsx` (513), `query/page.tsx` (505) each contain multiple visual states that should be separate components

### Accessibility Gaps
1. Query textarea has no `<label>` or `aria-label` — screen readers can't identify it
2. Ingest mode toggle buttons lack `aria-pressed`/`aria-selected`
3. Settings status dots rely on color only — no text alternative on the dot itself
4. Save-answer form label not programmatically associated with input (`htmlFor`/`id` missing)

## Bugs / Friction Found

### Confirmed Bugs
1. **`GlobalSearch.tsx` perf bug** — `fetchPages()` fires on every keystroke with no debounce/cache; should fetch once on open or debounce
2. **Residual TOCTOU in `lifecycle.ts`** — cross-ref phase calls `listWikiPages()` outside the file lock
3. **`lifecycle.ts` delete path** — `fs.unlink(filePath)` has no try/catch; concurrent deletes can throw unhandled ENOENT
4. **Dead re-exports in `ingest.ts`** — re-exports `findRelatedPages`, `updateRelatedPages`, `slugify`, `MAX_LLM_INPUT_CHARS` for backward compat, adding confusing indirection

### Code Smells
1. **`lint.ts` dual-exports** — re-exports `extractWikiLinks` from `./links` and exports `extractCrossRefSlugs` (private function) for tests only
2. **14 chained `.replace()` calls in `stripHtml`** — creates 14 intermediate strings; single-pass entity map would be more efficient
3. **Severity counting duplicated** in `lint.ts` — `buildSummary()` and log-summary code both iterate issues array 3x each
4. **Test-only exports** — `_getPageCacheSize` (wiki.ts), `_resetLocks` (lock.ts) pollute public API with underscore-prefixed internals

### Build Friction
- **None** — build, test, and lint all pass cleanly. Only `pnpm install` needed (node_modules not present by default in CI).
- Minor: query-history tests emit stderr (ENOENT on missing JSON file) — expected behavior but noisy in test output
