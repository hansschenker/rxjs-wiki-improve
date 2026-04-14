# Assessment — 2026-04-14

## Build Status
✅ PASS — `pnpm build` succeeds (28 routes), `pnpm lint` clean, `pnpm test` passes all 592 tests across 14 test files. No type errors. Build emits benign ENOENT warnings for missing `wiki/index.md` and `wiki/log.md` (expected when no wiki content exists).

## Project State
All four founding vision pillars are fully implemented:

| Pillar | Status | Key capabilities |
|--------|--------|-----------------|
| **Ingest** | ✅ | URL fetch (Readability), text paste, batch multi-URL, content chunking, human-in-the-loop preview, raw source persistence |
| **Query** | ✅ | BM25 + optional vector search (RRF fusion), streaming responses, citations, save-answer-to-wiki, query history |
| **Lint** | ✅ | 6 checks (orphan, stale-index, empty, missing-crossref, contradiction, missing-concept-page), all with auto-fix |
| **Browse** | ✅ | Wiki index with search/filter, page view with backlinks, edit/delete/create, interactive D3 graph with clustering, log viewer, raw source browser, global search, Obsidian export |

**Multi-provider LLM** via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama). Settings UI for provider config. Embedding support for OpenAI/Google/Ollama (Anthropic has no embedding API — graceful BM25 fallback).

## Recent Changes (last 3 sessions)
From the journal, the last 3 sessions (2026-04-13) were all hardening/polish:

1. **2026-04-13 13:57** — Settings page decomposed into sub-components (ProviderForm, EmbeddingSettings), shared Alert component, `getErrorMessage` utility extracted across all API routes.
2. **2026-04-13 06:09** — Graph clustering (label propagation, color-coded nodes), `ingest.ts` decomposed (URL fetching → `fetch.ts`), performance fixes (cached page reads in `findBacklinks`, eliminated double-read in query).
3. **2026-04-13 02:01** — HiDPI graph fix (canvas DPR scaling), cross-ref false positive fix (partial slug matching), embeddings data integrity (atomic writes, model-mismatch detection, text truncation).

The project has been in hardening mode for ~10 sessions — no new features since the core was completed around session 6.

## Source Architecture

**88 source files, ~18,500 total lines**

| Layer | Files | Lines | Description |
|-------|------:|------:|-------------|
| `src/lib/` | 19 | ~5,000 | Core logic (ingest, query, lint, embeddings, config, lifecycle, wiki, fetch) |
| `src/lib/__tests__/` | 14 | ~7,600 | Test suite (592 tests) |
| `src/app/` (pages) | 20 | ~3,300 | Next.js pages and error boundaries |
| `src/app/api/` | 14 | ~1,000 | API route handlers (28 HTTP handlers) |
| `src/components/` | 12 | ~1,600 | React components |

**Largest lib modules:**
- `wiki.ts` (658) — filesystem ops, index, log, search, backlinks, page cache
- `lint.ts` (571) — 6 lint checks including LLM-powered contradiction detection
- `query.ts` (548) — BM25, vector search, RRF fusion, LLM synthesis
- `embeddings.ts` (472) — provider-agnostic vector store
- `ingest.ts` (461) — LLM page generation, chunking
- `lint-fix.ts` (452) — auto-fix handlers for all lint issue types

**Largest UI files:**
- `graph/page.tsx` (581) — canvas-based force graph, all in one component
- `ingest/page.tsx` (517) — three-stage form (input → preview → success)
- `query/page.tsx` (508) — streaming query + history + save-to-wiki
- `settings/page.tsx` (402) — provider config, embedding settings
- `lint/page.tsx` (348) — issue list with per-issue fix buttons

## Open Issues Summary
No open issues on GitHub (`gh issue list` returns `[]`).

## Gaps & Opportunities

### vs. llm-wiki.md founding vision
1. **Image/asset handling** — images in source HTML are dropped during ingest. Vision mentions downloading images locally and having the LLM reference them.
2. **Marp slide deck output** — vision mentions generating presentations from wiki content. Not implemented.
3. **Dataview-style queries** — vision mentions Obsidian Dataview for frontmatter queries. Frontmatter exists but no dynamic query capability.
4. **CLI tool** — vision mentions CLI for headless operation. Only web UI exists.
5. **Obsidian plugin** — export-to-zip exists, but no real Obsidian plugin.
6. **Multi-user / auth** — not started.

### vs. YOYO.md current direction
All four pillars (ingest, query, lint, browse) are built. The "open questions" (CLI vs web, providers, local-first vs cloud, auth) are partially resolved (web app, multi-provider, local-first, no auth).

### Code quality gaps identified in review
1. **Graph page (581 lines)** is a monolith: physics, rendering, tooltips, legend all inline. O(n²) repulsion with no spatial optimization. `matchMedia` and `nodeMap` recreated every frame.
2. **Ingest page (517 lines)** has three stages crammed into one component with no sub-components.
3. **Query page (508 lines)** mixes query form, streaming, results, save-to-wiki, and history sidebar.
4. **Duplicate `relativeTime` implementations** in `query/page.tsx` and `WikiIndexClient.tsx`.
5. **`listWikiPages` reads every page from disk** on most API calls to enrich with frontmatter. Combined with `buildCorpusStats` in query, a single query triggers 2× full disk scans.
6. **O(n²) cross-ref check in lint** — every page tested against every other page for title mentions.
7. **No abort/cancellation in ingest** — unlike query which has AbortController.
8. **Accessibility**: Canvas graph is mouse-only (keyboard events not wired). BatchIngestForm uses emoji-only status indicators. No `aria-label` on nav element.
9. **`fixContradiction` doesn't check `hasLLMKey()`** — will throw opaque error without an LLM key.
10. **Module-level page cache** in `wiki.ts` could leak between requests if a crash occurs between begin/cleanup.

## Bugs / Friction Found

### From build output
- ENOENT warnings for `wiki/index.md` and `wiki/log.md` during build (benign but noisy for fresh installs).

### From code review
1. **Graph performance**: `nodeMap` (O(n) allocation) and `matchMedia` query recreated every animation frame inside `simulate()`.
2. **`fixContradiction` missing `hasLLMKey()` guard** — will crash with unclear error if no LLM is configured.
3. **Race condition in lint page**: `fixMessage` state shared across all fix operations; rapid fixes overwrite each other's messages.
4. **`source_count` stored as string** in frontmatter (`"1"` not `1`), parsed back with `Number()`.
5. **Duplicate `relativeTime`** utility implementations with different thresholds.
6. **No request cancellation on ingest page** — navigating away during a long ingest leaves the fetch in-flight.
7. **`settings/page.tsx`** uses `data.provider!` non-null assertion that could crash if provider is unexpectedly null.
8. **`lint.ts:521`** barrel export of 8+ symbols on one line — maintenance friction.
