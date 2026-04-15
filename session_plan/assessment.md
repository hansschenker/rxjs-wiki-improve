# Assessment — 2026-04-15

## Build Status

✅ **All green** — `pnpm build`, `pnpm lint`, and `pnpm test` all pass.
- **606 tests** across 15 test files (0 failures)
- **13 pages**, **17 API route files** (21 handlers)
- **0 type errors**, 0 ESLint warnings
- Build output: 30 routes (static + dynamic)

## Project State

The app implements all four founding vision pillars end-to-end:

| Pillar | Status | Key capabilities |
|--------|--------|-----------------|
| **Ingest** | ✅ | URL fetch (Readability + linkedom), text paste, batch multi-URL, content chunking, human-in-the-loop preview, raw source persistence |
| **Query** | ✅ | BM25 + optional vector search (RRF fusion), streaming responses, LLM re-ranking, citation extraction, save-answer-to-wiki loop, query history |
| **Lint** | ✅ | 7 checks (orphan, stale-index, empty, missing-crossref, contradiction, missing-concept-page, broken-link), all with LLM-powered auto-fix |
| **Browse** | ✅ | Wiki index with search/filter, page view with backlinks, edit/delete/create, interactive force-directed graph with clustering, log viewer, raw source browser, global search, Obsidian export |

**Supporting infrastructure:** Multi-provider LLM (Anthropic, OpenAI, Google, Ollama via Vercel AI SDK), in-browser settings UI, embedding-powered vector search, file locking, SSRF protection, YAML frontmatter, page lifecycle pipeline.

## Recent Changes (last 3 sessions)

From journal (2026-04-14):

1. **2026-04-14 14:02** — Query re-ranking optimization (narrow LLM re-rank to fusion candidates only), shared `formatRelativeTime` utility extraction, bug fixes (O(n) array scan → Set in citations, useState initializer perf, missing clearTimeout cleanup).
2. **2026-04-14 03:26** — Ingest page decomposition into sub-components (IngestPreview, IngestSuccess, BatchIngestForm), three bug fixes (fixContradiction JSON validation, settings non-null assertion crash, concurrent lint-fix race), graph page per-frame performance optimizations.
3. **2026-04-13 13:57** — Settings page decomposition (ProviderForm, EmbeddingSettings), shared Alert component, `getErrorMessage` utility extraction adopted across all API routes.

**Pattern:** Last 6+ sessions have been hardening/polish/dedup — no major new features, focused on code quality, component decomposition, bug fixes, and performance optimization.

## Source Architecture

### Codebase: ~20,500 lines

| Layer | Files | Lines | Description |
|-------|------:|------:|-------------|
| `src/lib/` | 20 | ~5,200 | Core logic (ingest, query, lint, embeddings, config, lifecycle, wiki, fetch, etc.) |
| `src/lib/__tests__/` | 15 | ~8,500 | Test suite (606 tests) |
| `src/app/` | 30 | ~4,500 | 13 pages + 17 API route files (21 handlers) |
| `src/components/` | 14 | ~2,300 | React components |

### Largest files (candidates for further attention)

| File | Lines | Notes |
|------|------:|-------|
| `wiki.ts` | 658 | Kitchen-sink: dir helpers, slug validation, I/O, index, log, search, backlinks |
| `wiki/graph/page.tsx` | 581 | God component: physics engine + renderer + tooltips + legend in one file |
| `lint.ts` | 571 | O(n²) cross-ref check, no opt-out for LLM-dependent checks |
| `query.ts` | 570 | BM25 index rebuilt from scratch every query, `saveAnswerToWiki` here (belongs elsewhere) |
| `query/page.tsx` | 493 | 9 useState hooks, 5 silent catch blocks, 110-line handleSubmit |
| `embeddings.ts` | 472 | Well-structured but Anthropic (default provider) has no embedding API |
| `ingest.ts` | 461 | 4 re-export blocks for backward compat, uncached `loadPageConventions` |

### Tech Stack

- Next.js 15.5.14 (App Router, Turbopack dev), React 19.1, TypeScript 5
- Tailwind CSS 4 with @tailwindcss/typography
- Vercel AI SDK 6 (ai, @ai-sdk/anthropic, @ai-sdk/openai, @ai-sdk/google, ollama-ai-provider-v2)
- Vitest 3, ESLint 9
- @mozilla/readability + linkedom for URL fetching
- react-markdown + remark-gfm for rendering
- archiver for Obsidian export (ZIP)
- Local filesystem storage (markdown + JSON)

## Open Issues Summary

**0 open GitHub issues** — the issue tracker is currently empty.

## Gaps & Opportunities

### Relative to llm-wiki.md (founding vision)

1. **No page revision history** — The vision says "the wiki is just a git repo… you get version history for free." The app stores only the current version of each page. No way to see what changed, when, or revert. This is the single biggest gap vs. the vision — the wiki *should* be a compounding artifact you can trace.
2. **No undo/trash for deletes** — Delete is permanent and immediate. No recycle bin, no "undo" — one misclick loses content.
3. **No bulk/file import** — The vision mentions Obsidian Web Clipper and dropping sources into the raw collection. The app only supports URL paste and text paste — no drag-and-drop file upload, no markdown file import.
4. **No image/asset handling** — The vision explicitly discusses downloading images locally and having the LLM view them. Ingest currently strips images entirely.
5. **No Dataview-style dynamic queries** — Vision mentions frontmatter-driven dynamic tables. YAML frontmatter exists but nothing queries it.
6. **Anthropic-only users get no vector search** — Anthropic has no embedding API. The most common deployment has zero vector search capability, falling back to pure BM25.

### Relative to YOYO.md product goals

7. **No CLI tool** — YOYO.md lists "CLI tool" as an open question. Headless ingest/query/lint would unlock scripting and CI-driven wiki maintenance.
8. **No multi-user/auth** — Listed in open questions, not started.
9. **No real Obsidian plugin** — Export exists (ZIP download), but no bidirectional sync or plugin.

### UX/Polish gaps

10. **No dark mode toggle** — Relies solely on OS `prefers-color-scheme`. No in-app control.
11. **No keyboard shortcuts** for power users beyond Cmd+K for global search.
12. **No pagination/virtualization** on wiki index — will degrade with 500+ pages.
13. **No confirmation for destructive lint fixes** — "Delete page" and "Remove from index" are one-click with no dialog.
14. **No loading/progress indicators** during content search in GlobalSearch.

### Architecture/Code quality

15. **wiki.ts is a kitchen-sink module** (658 lines) — search, backlinks, cross-refs, and core I/O all mixed together.
16. **BM25 corpus rebuilt from scratch on every query** — no caching between requests.
17. **Graph page is a god component** (581 lines) — physics, rendering, hit-testing, and theming in one file.
18. **Re-export chains** across ingest.ts → wiki.ts → lifecycle.ts create confusing import paths.
19. **`loadPageConventions` reads SCHEMA.md from disk on every call** — no caching.
20. **`saveAnswerToWiki` lives in query.ts** but is a write-path concern — creates a query→ingest dependency.

## Bugs / Friction Found

### Bugs

1. **`ctx.roundRect` in graph page** — Not supported in Safari <16. No polyfill or fallback. Will throw for Safari users.
2. **Module-level `pageCache` race** — Shared mutable state (`Map`) at module scope. Concurrent requests can interleave `beginPageCache()`/cleanup calls, corrupting cache state.
3. **Lint page React keys use array index** — `key={...-${i}}` with array index. When issues are removed from the middle after fixes, this causes stale/mismatched renders.

### Friction / Code Smells

4. **21+ silent `catch {}` blocks** across frontend code — errors swallowed with no logging. Debugging production issues will be painful.
5. **O(n²) cross-ref check** in lint.ts — compiles a regex per page pair. 100 pages = 10,000 regex compilations.
6. **`alert()` for export error** in WikiIndexClient — uses browser native dialog, inconsistent with app's Alert component.
7. **Settings "Test Connection" is misleading** — only checks config existence via `/api/status`, doesn't actually test LLM connectivity.
8. **`source_count` stored as string** in YAML frontmatter — requires defensive parsing everywhere consumed.
9. **handleFix in lint page** is 100 lines with deeply nested conditionals and copy-pasted success/error patterns.
10. **Duplicate GlobalSearch instances** — rendered separately in desktop and mobile nav with independent state.
