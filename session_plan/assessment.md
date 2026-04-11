# Assessment — 2026-04-11

## Build Status
**All green.** `pnpm build` succeeds (Next.js 15 production build), `pnpm lint` clean, `pnpm test` passes all 406 tests across 10 test files.

## Project State
The app is a fully functional LLM Wiki web application implementing all four pillars from the founding vision:

### Core Operations
- **Ingest** — URL fetching (Readability + linkedom), text pasting, batch multi-URL ingest, human-in-the-loop preview mode, content chunking for long docs, dedup on re-ingest, cross-reference discovery and backlink injection
- **Query** — BM25 + optional vector search (RRF fusion), streaming responses via Vercel AI SDK, cited answers, "save answer to wiki" loop
- **Lint** — orphan pages, missing cross-refs, stale index entries, empty/short stubs, LLM-powered contradiction detection; auto-fix for orphan-page, stale-index, empty-page, and missing-crossref issues
- **Browse** — wiki index with search/tag filters, individual page view with markdown rendering, D3 force-directed graph view, raw source browsing, activity log viewer

### Infrastructure
- Multi-provider LLM via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama)
- Provider-agnostic embedding layer (OpenAI, Google, Ollama; graceful BM25 fallback for Anthropic-only)
- Settings UI for provider/model/API key config (persisted JSON config store)
- YAML frontmatter on wiki pages (title, slug, sources, timestamps)
- Full CRUD: create, read, edit, delete wiki pages
- Obsidian export (zip with `[[wikilinks]]`)
- Error boundaries, loading states, mobile-responsive nav
- Status badge showing LLM config health

### Scale
- **14,529 lines** total TypeScript/TSX
  - Library: 4,044 lines (13 modules)
  - Tests: 5,834 lines (10 test files, 406 tests)
  - Pages: 2,623 lines (15 routes)
  - API routes: 870 lines (13 endpoints)
  - Components: 1,063 lines (7 components)

## Recent Changes (last 3 sessions)
1. **2026-04-11 01:45** — New page creation flow, error boundaries + loading states on all routes, lint-fix business logic extracted into testable `lint-fix.ts` module
2. **2026-04-10 20:27** — Theme-aware graph view (light/dark), SCHEMA.md accuracy corrections, embedding config bug fix (Settings UI values were being ignored)
3. **2026-04-10 16:42** — Batch ingest (multi-URL endpoint + progress UI), empty-state onboarding for new users, SCHEMA.md refresh

Git log shows only 1 squashed commit on this branch (`fa4d350 yoyo: growth session wrap-up`).

## Source Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── ingest/          route.ts (58L), batch/route.ts (91L)
│   │   ├── lint/            route.ts (18L), fix/route.ts (48L)
│   │   ├── query/           route.ts (34L), save/route.ts (41L), stream/route.ts (80L)
│   │   ├── raw/[slug]/      route.ts (34L)
│   │   ├── settings/        route.ts (117L)
│   │   ├── status/          route.ts (6L)
│   │   └── wiki/            route.ts (92L), [slug]/route.ts (126L),
│   │                        export/route.ts (72L), graph/route.ts (53L)
│   ├── ingest/page.tsx      (513L) — ingest form with preview mode
│   ├── lint/page.tsx        (295L) — lint results + auto-fix UI
│   ├── query/page.tsx       (329L) — query interface with streaming
│   ├── raw/                 page.tsx (88L), [slug]/page.tsx (86L)
│   ├── settings/page.tsx    (544L) — provider/model/key config
│   ├── wiki/
│   │   ├── page.tsx         (23L) — index wrapper
│   │   ├── [slug]/          page.tsx (118L), edit/page.tsx (44L), not-found.tsx (29L)
│   │   ├── graph/page.tsx   (307L) — D3 force graph
│   │   ├── log/page.tsx     (31L)
│   │   └── new/page.tsx     (150L)
│   ├── page.tsx             (95L) — home with onboarding
│   ├── layout.tsx, globals.css, error.tsx, loading.tsx
│
├── components/
│   ├── NavHeader.tsx        (203L) — responsive nav with hamburger menu
│   ├── WikiIndexClient.tsx  (249L) — searchable/filterable index
│   ├── BatchIngestForm.tsx  (317L) — multi-URL ingest
│   ├── WikiEditor.tsx       (96L)
│   ├── MarkdownRenderer.tsx (59L)
│   ├── StatusBadge.tsx      (84L)
│   └── DeletePageButton.tsx (55L)
│
├── lib/
│   ├── ingest.ts            (636L) — URL fetch, HTML clean, LLM summarize, chunking
│   ├── query.ts             (541L) — BM25, RRF, context building, LLM answer
│   ├── wiki.ts              (426L) — filesystem ops, index, log, cross-refs
│   ├── lint.ts              (408L) — 5 check types incl. LLM contradiction detection
│   ├── embeddings.ts        (366L) — vector store, cosine similarity, multi-provider
│   ├── config.ts            (353L) — JSON config store, env var fallback
│   ├── lifecycle.ts         (326L) — writeWikiPageWithSideEffects, deleteWikiPage
│   ├── frontmatter.ts       (267L) — YAML parse/serialize
│   ├── lint-fix.ts          (246L) — auto-fix for 4 issue types
│   ├── llm.ts               (182L) — callLLM, callLLMStream wrappers
│   ├── raw.ts               (125L) — raw source CRUD
│   ├── types.ts             (74L) — shared interfaces
│   ├── providers.ts         (46L) — provider constants
│   ├── export.ts            (27L) — Obsidian link conversion
│   ├── citations.ts         (21L) — citation slug extraction
│   └── __tests__/           (5,834L across 10 files, 406 tests)
```

## Open Issues Summary
**No open issues** — `gh issue list` returned an empty array. The project is community-driven via GitHub issues but none are currently open.

## Gaps & Opportunities

### Relative to llm-wiki.md vision:
1. **No image/asset handling** — URL ingest drops images entirely. The founding vision mentions downloading images locally and having the LLM reference them. SCHEMA.md lists this as a known gap.
2. **No batch vector index rebuild** — embeddings are generated incrementally on write but there's no way to rebuild the full store if you switch providers or the store gets corrupted.
3. **No contradiction auto-fix** — lint detects contradictions via LLM but can't auto-resolve them. The other 4 issue types have auto-fix.
4. **No concurrency safety** — simultaneous ingests could corrupt `index.md` or `log.md`. SCHEMA.md flags this.
5. **No Marp/slide deck output** — the vision mentions generating presentations from wiki content.
6. **No Dataview-style frontmatter queries** — pages have YAML frontmatter but there's no dynamic query interface for it.

### Relative to YOYO.md web app vision:
7. **No auth or multi-user** — listed as an open question in YOYO.md. Currently single-user local-first only.
8. **No real-time collaboration** — the vision mentions "humans in the loop reviewing updates" for team use.

### Quality & Polish opportunities:
9. **Large page components** — `settings/page.tsx` (544L), `ingest/page.tsx` (513L), `query/page.tsx` (329L), `graph/page.tsx` (307L) are monolithic client components that could be decomposed for maintainability.
10. **Graph view could be richer** — journal repeatedly mentions "improving the graph view with backlink counts and clustering" as a next step but it hasn't been done yet.
11. **Search could be more visible** — the wiki index has search but there's no global search bar in the nav header.
12. **No keyboard shortcuts** — power users navigating a wiki benefit from keyboard-driven navigation.
13. **Character-based token counting** — chunking uses chars (12K ≈ 3K tokens) which is conservative but imprecise. A tokenizer would be more accurate.

### Developer experience:
14. **No E2E tests** — all 406 tests are unit/integration tests on library code. No browser-level or API route testing.
15. **No CI** — while there are GitHub Actions workflows, the grow workflow is for yoyo sessions, not for PR validation. No CI pipeline runs build+lint+test on pushes.

## Bugs / Friction Found
- **No bugs found** — build, lint, and all tests pass clean. No TODOs, FIXMEs, or HACKs in source.
- **No ESLint warnings** — lint output is completely clean.
- The codebase is in good health after 16+ growth sessions of iterative development.
- The journal's "next" items have been consistent for several sessions: "contradiction auto-fix in lint, or improving the graph view with backlink counts and clustering" — suggesting these are the natural next priorities.
