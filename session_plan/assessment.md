# Assessment — 2026-04-15

## Build Status

✅ **All green.** `pnpm build`, `pnpm lint`, and `pnpm test` pass cleanly.
- **616 tests** across 16 test files, all passing
- Production build compiles with zero type errors
- ESLint clean — no warnings or errors
- Stderr noise from expected ENOENT logs in test temp dirs (not a problem)

## Project State

The project is **feature-complete relative to the founding vision's core scope.** All four pillars (ingest, query, lint, browse) are fully implemented with rich sub-features:

| Pillar | Implementation | Key capabilities |
|--------|---------------|-----------------|
| **Ingest** | ✅ Full | URL fetch (Readability + linkedom), text paste, batch multi-URL, content chunking, human-in-the-loop preview, raw source persistence, cross-ref cascade |
| **Query** | ✅ Full | BM25 + optional vector search with RRF fusion, LLM re-ranking, streaming responses, citation extraction, save-answer-to-wiki loop, query history |
| **Lint** | ✅ Full | 7 check types (orphan, stale-index, empty, missing-crossref, broken-link, contradiction, missing-concept), auto-fix for all types |
| **Browse** | ✅ Full | Wiki index with search/filter, page view with backlinks, edit/delete/create, interactive force-directed graph with clustering, log viewer, raw source browser, global search, Obsidian export, revision history |

**Supporting infrastructure:** Multi-provider LLM (Anthropic, OpenAI, Google, Ollama via Vercel AI SDK), browser-based settings UI, file locking, SSRF protection, error boundaries on all routes, frontmatter metadata, page caching.

## Recent Changes (last 3 sessions)

| Session | Date | Focus |
|---------|------|-------|
| Latest | 2026-04-15 03:24 | Page revision history system (snapshots, diffs, restore), Safari `roundRect` fix, React key dedup on lint page, `withPageCache` race condition fix |
| Previous | 2026-04-14 14:02 | Query re-ranking optimization (only rank fusion candidates), shared `formatRelativeTime` extraction, O(n) → Set lookup in citations, useState initializer fix, missing `clearTimeout` cleanup |
| Before that | 2026-04-14 03:26 | Ingest page decomposition into sub-components, `fixContradiction` JSON validation bug, settings null assertion crash fix, concurrent lint-fix race fix, graph canvas performance fixes |

**Trend:** The last ~10 sessions have been hardening/polish/dedup — no major new features, systematic tightening of reliability, performance, and code quality.

## Source Architecture

### Codebase: ~21,330 lines across 96 source files

| Layer | Files | Lines | Description |
|-------|------:|------:|-------------|
| `src/lib/` | 22 | 5,848 | Core logic (ingest, query, lint, embeddings, config, lifecycle, wiki, fetch) |
| `src/lib/__tests__/` | 16 | 8,943 | Test suite (616 tests) |
| `src/components/` | 14 | 2,205 | React UI components |
| `src/app/` pages | 16 | 2,885 | Next.js page routes |
| `src/app/api/` | 14 | 1,251 | API route handlers |
| Other (layout, error, css) | 14 | 198 | Scaffolding |

### Largest files (>400 lines)

| File | Lines | Notes |
|------|------:|-------|
| `wiki.ts` | 681 | Core data layer — CRUD, index, cache, search, cross-refs |
| `graph/page.tsx` | 598 | Canvas force-graph — physics, rendering, interaction, theming |
| `lint.ts` | 571 | 7 lint checks — structural + LLM-powered |
| `query.ts` | 570 | BM25 + vector + RRF fusion + re-ranking + LLM query |
| `query/page.tsx` | 493 | ~16 useState, streaming, history, save-to-wiki |
| `embeddings.ts` | 472 | Vector store, embed/search, rebuild |
| `ingest.ts` | 461 | URL/text ingest orchestration |
| `lint-fix.ts` | 458 | Auto-fix for all 7 lint issue types |

### Key dependencies
- Next.js 15.5, React 19.1, Vercel AI SDK 6.x
- `@mozilla/readability` + `linkedom` for URL content extraction
- `react-markdown` + `remark-gfm` for rendering
- `archiver` for Obsidian export

## Open Issues Summary

**No open GitHub issues.** The `gh issue list` returned an empty array. Community hasn't filed any requests yet — development is currently vision-driven.

## Gaps & Opportunities

### Relative to founding vision (`llm-wiki.md`)

1. **Image/asset handling** — The founding vision discusses downloading images locally and having the LLM view them separately. Currently ingest drops all images. This is a notable gap for research and book-reading use cases.

2. **CLI tool** — `llm-wiki.md` §Optional CLI tools discusses headless search/ingest. No CLI exists. Users who want Obsidian-as-IDE + LLM-as-programmer workflow (the founding vision's primary mode) can't use this project at all — it's web-only.

3. **Dataview-style dynamic queries** — Frontmatter exists on pages but there's no way to query it dynamically (tables, aggregations). The vision mentions this via Obsidian Dataview plugin.

4. **Marp slide generation** — The vision mentions generating slide decks from wiki content. Not implemented.

5. **Schema co-evolution** — `SCHEMA.md` exists but the lint and query system prompts don't load it at runtime the way ingest does. Learnings.md explicitly flags this as a gap.

### Relative to YOYO.md direction

6. **No onboarding walkthrough** — Empty-state guidance exists on the home page, but no guided first-ingest tutorial for new users.

7. **Mobile / responsive UX** — Graph canvas has a fixed height (560px), no responsive design pass has been done.

8. **Vector search for Anthropic-only users** — Anthropic has no embedding API. The most common deployment (Anthropic-only) gets no vector search, falling back to pure BM25. No workaround offered (e.g., suggesting a second provider just for embeddings).

### Code quality & architecture

9. **Large page components** — `query/page.tsx` (493 lines, 16+ useState), `lint/page.tsx` (399 lines), `graph/page.tsx` (598 lines) haven't been decomposed. The ingest and settings pages were decomposed in recent sessions — these three remain.

10. **Brittle message parsing in lint UI** — The lint page parses machine data (slugs) from human-readable lint messages via regex. If lint message formats change, the UI silently breaks. The API should return structured target slugs instead.

11. **`wiki.ts` is overloaded at 681 lines** — Mixes CRUD, caching, search, cross-refs, index management, and logging. `searchWikiContent()` and `findRelatedPages()`/`findBacklinks()` are extraction candidates.

12. **LLM JSON parsing not shared** — `parseLLMJsonArray` exists in `lint.ts` but isn't used by other modules that also parse JSON from LLM output.

13. **Serial page reads in loops** — `findBacklinks`, lint checks, and others iterate pages with sequential `await readWikiPage` where `Promise.all` could parallelize.

14. **Module-level mutable state for page cache** — `wiki.ts` uses module-level `Map` with reference counting. Fragile in serverless/edge environments where module state may or may not persist between requests.

15. **`saveQueryAsPage` doesn't call `validateSlug`** — It calls `slugify` but skips validation before writing.

## Bugs / Friction Found

1. **Lint fix key collision** — The lint page uses `${issue.type}:${issue.slug}` as fix dedup key, which collides when multiple issues of the same type affect the same slug (e.g., multiple broken links from one page).

2. **`slug: ""`  in lint info messages** — `checkMissingConceptPages` uses an empty slug for its "skipped" info message, which could cause downstream issues if anything tries to use it as a file path.

3. **Test stderr noise** — Expected ENOENT errors in tests print to stderr, making test output noisy. Not a bug but friction for contributors reading test output.

4. **Timeout ref accumulation** — The lint page's `timeoutsRef` array accumulates timeout IDs without cleanup — minor memory leak in long sessions.

5. **`X-Wiki-Sources` custom header** — Query streaming sends source slugs via a custom HTTP header. Proxies and CDNs may strip custom headers, breaking citation display for deployed instances.

6. **Status report stale** — `.yoyo/status.md` dates from 2026-04-12 (session 20) and reports 503 tests — now 616. Due for refresh.
