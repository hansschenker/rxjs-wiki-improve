# Assessment — 2026-04-11

## Build Status
**All green.** `pnpm build` passes cleanly (no warnings), `pnpm lint` passes (no errors), `pnpm test` passes — 10 test files, 414 tests, 0 failures. Clean slate.

## Project State
The app is a fully-functional Next.js 15 web application implementing all four pillars of the LLM Wiki founding vision:

**Core operations (all working):**
- **Ingest** — URL fetching (Readability + linkedom), text paste, batch multi-URL mode, human-in-the-loop preview, content chunking for long docs, cross-reference propagation to related pages
- **Query** — BM25 + optional vector search (RRF fusion), LLM-based page selection, streaming responses, save-answer-to-wiki loop
- **Lint** — 5 check types (orphan-page, stale-index, empty-page, missing-crossref, contradiction), auto-fix for 4 of 5 (contradiction fix not implemented)
- **Browse** — wiki index with search/tag filters, individual page view, edit/delete CRUD, raw source browsing, interactive D3 graph view, Obsidian export, global search bar

**Infrastructure:**
- Multi-provider LLM via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama)
- Settings UI for provider/model/API key configuration (persisted JSON config file)
- Embedding layer (OpenAI, Google, Ollama — not Anthropic) with JSON vector store
- YAML frontmatter on all wiki pages
- SCHEMA.md co-evolves with the codebase
- Error boundaries on all routes, mobile-responsive nav, dark mode support

**By the numbers:**
- ~15,500 lines of source code (src/)
- ~6,050 lines of tests (414 tests across 10 files)
- 16 library modules, 15 API routes, 14 page routes, 8 components
- 37 project learnings entries

## Recent Changes (last 3 sessions)
1. **2026-04-11 08:35** — Error boundaries on sub-routes, centralized constants.ts, API error handling bug fixes
2. **2026-04-11 05:22** — Vector store rebuild endpoint, global search bar in NavHeader, graph view enrichment (node sizing, tooltips)
3. **2026-04-11 01:45** — New page creation flow, error boundaries, lint-fix extraction into testable module

The last ~5 sessions have been polish/hardening — no net-new major features. The journal repeatedly notes "maybe LLM-powered contradiction auto-fix in lint, or improving query re-ranking" as next candidates but neither has been tackled.

## Source Architecture

```
src/ (15,559 lines total)
├── lib/                    (4,165 lines — core logic)
│   ├── ingest.ts           627   URL fetch, chunking, LLM wiki generation
│   ├── query.ts            536   BM25, vector search, RRF, context building
│   ├── embeddings.ts       440   Provider-agnostic vectors, JSON store
│   ├── wiki.ts             426   Filesystem ops, index, log, cross-refs
│   ├── lint.ts             408   5 check types incl. LLM contradiction scan
│   ├── config.ts           353   Settings persistence, env/config resolution
│   ├── lifecycle.ts        326   Write/delete pipeline (shared side effects)
│   ├── frontmatter.ts      267   YAML frontmatter parse/serialize
│   ├── lint-fix.ts         246   Auto-fix for 4 lint issue types
│   ├── llm.ts              182   Thin wrapper over Vercel AI SDK
│   ├── raw.ts              125   Raw source CRUD
│   ├── types.ts             74   Shared interfaces
│   ├── constants.ts         61   Tunable magic numbers
│   ├── providers.ts         46   Provider registry
│   ├── export.ts            27   Obsidian link conversion
│   └── citations.ts         21   Citation slug extraction
│
├── lib/__tests__/          (6,049 lines — unit tests)
│   ├── wiki.test.ts       1,324
│   ├── ingest.test.ts     1,193
│   ├── query.test.ts        998
│   ├── embeddings.test.ts   976
│   ├── lint.test.ts          632
│   ├── lint-fix.test.ts      396
│   ├── config.test.ts        334
│   ├── llm.test.ts           124
│   ├── export.test.ts         65
│   └── smoke.test.ts           7
│
├── app/                    (pages + API routes)
│   ├── api/                15 route handlers
│   │   ├── ingest/         POST + batch POST
│   │   ├── query/          POST, stream, save
│   │   ├── lint/           POST + fix
│   │   ├── wiki/           CRUD, graph, export
│   │   ├── raw/            GET [slug]
│   │   ├── settings/       GET/PUT + rebuild-embeddings
│   │   └── status/         GET
│   ├── ingest/page.tsx     513  (includes preview mode)
│   ├── settings/page.tsx   616  (provider/model config)
│   ├── wiki/graph/page.tsx 442  (D3 force graph)
│   ├── query/page.tsx      329  (streaming answers)
│   ├── lint/page.tsx       295  (issue list + auto-fix)
│   ├── page.tsx             95  (home/dashboard)
│   └── ... (14 more page routes with error boundaries)
│
└── components/             (8 components, 1,352 lines)
    ├── BatchIngestForm.tsx  316
    ├── GlobalSearch.tsx     271
    ├── WikiIndexClient.tsx  249
    ├── NavHeader.tsx        215
    ├── WikiEditor.tsx        96
    ├── StatusBadge.tsx       91
    ├── MarkdownRenderer.tsx  59
    └── DeletePageButton.tsx  55
```

## Open Issues Summary
No open issues on GitHub at this time. The project is entirely vision-driven.

## Gaps & Opportunities

**High-value gaps (relative to founding vision in llm-wiki.md):**

1. **No retry/resilience in LLM calls** — `llm.ts` is a single-shot wrapper with no retry, no rate limiting, no timeout config. A transient 429 or 503 from any provider silently fails the operation. This affects every LLM-dependent feature (ingest, query, lint contradiction check).

2. **No concurrency safety** — SCHEMA.md explicitly flags this. `index.md` and `log.md` writes are classic TOCTOU races. Batch ingest processes URLs sequentially (one at a time) but two browser tabs or two ingest calls could corrupt shared files. File-level locking or a write queue would fix this.

3. **No API route tests** — 15 API route files with zero test coverage. All 414 tests are unit tests on library functions. HTTP-level behaviors (status codes, error responses, request validation, edge cases) are untested.

4. **Bloated page components** — settings/page.tsx (616), ingest/page.tsx (513), graph/page.tsx (442) are monolithic. Each mixes data fetching, form state, UI rendering, and business logic. These are ripe for component extraction.

5. **No PDF or file upload support** — Ingest only handles URLs and pasted text. PDFs, local files, and other document formats are unsupported. The founding vision mentions "articles, papers, images, data files" as source types.

6. **No image/asset handling** — Images in fetched HTML are silently dropped. The founding vision and tips section discuss image handling (Obsidian attachments, LLM image viewing).

7. **Query doesn't scale past ~100 pages** — `buildCorpusStats()` reads every page from disk on every query. `listWikiPages()` reads all frontmatter on every call (no caching). The full index text is sent to the LLM for page selection. All fine for now but will hit a wall.

8. **Contradiction auto-fix** — Repeatedly flagged in journal as "next item" for 5+ sessions but never implemented. The lint-fix dispatcher throws on contradiction type.

9. **No accessibility** — NavHeader lacks `aria-label` on `<nav>`, no focus trap on mobile menu, no skip-to-content link, no keyboard navigation for dropdown, settings icon lacks `aria-label`.

10. **No Marp/slide deck or chart output** — The founding vision mentions Marp slide decks and matplotlib charts as query output formats. Not implemented.

**Lower-priority gaps:**
- No auth or multi-user support (flagged as open question in YOYO.md)
- No CLI tool (vision mentions this as optional)
- No web clipper integration
- No Dataview-style frontmatter queries
- Token counting is character-based, not tokenizer-exact

## Bugs / Friction Found

1. **Misleading concurrency comment** — `lifecycle.ts` line 195 says "Re-read so we never clobber concurrent updates" but the re-read is not atomic with the write. The comment is aspirational, not descriptive.

2. **Silent error swallowing in LLM calls** — Several callers catch LLM errors with bare `catch {}` blocks (lint.ts, query.ts), meaning transient provider failures produce empty/degraded results with no user feedback.

3. **`listWikiPages()` reads all pages on every call** — Called multiple times per operation (query start, lifecycle pipeline, graph building). No caching layer. Will become a performance issue.

4. **Two `@ts-expect-error`/`eslint-disable` suppressions** — One in wiki.test.ts (testing runtime validation, justified), one in graph/page.tsx (react-hooks/exhaustive-deps, should be reviewed).

5. **No `eslint-disable` justification** in graph/page.tsx — the suppressed dependency warning may indicate a stale effect or missing dependency that could cause subtle bugs.
