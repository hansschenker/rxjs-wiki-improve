# Assessment — 2026-04-11

## Build Status

All green.

- `pnpm build` — ✅ compiles, 23 static pages generated, no warnings
- `pnpm test` — ✅ 9 test files, 385 tests pass (2.7s)
- `pnpm lint` — ✅ clean

## Project State

The app is a **fully functional local-first LLM wiki** implementing all four pillars from the founding vision:

| Pillar | Status | Scope |
|--------|--------|-------|
| **Ingest** | Complete | URL + text + batch, preview/approve flow, content chunking, cross-referencing, YAML frontmatter |
| **Query** | Complete | BM25 + optional vector search (RRF fusion), streaming responses, save-answer-to-wiki |
| **Lint** | Complete | 5 checks (orphan, stale-index, empty, missing-crossref, LLM contradiction), auto-fix for 4 of 5 |
| **Browse** | Complete | Wiki index with search/tag filters, page view, editor, delete, graph view, activity log, raw source browser |

**Supporting infrastructure:**
- Multi-provider LLM (Anthropic, OpenAI, Google, Ollama) via Vercel AI SDK
- Settings UI with config persistence (JSON file, env var fallback)
- Provider-agnostic embeddings with local JSON vector store
- Obsidian export (zip with wikilinks)
- Unified lifecycle pipeline for all write/delete paths
- Schema-driven prompts (SCHEMA.md loaded at runtime)
- Mobile-responsive nav with dark/light mode support
- Status indicator for LLM configuration
- Empty-state onboarding for new users

**Codebase size:** ~13,750 lines across 54 source files (8,300 app + 5,450 tests).

## Recent Changes (last 3 sessions)

1. **2026-04-10 20:27** — Theme-aware graph view, SCHEMA.md accuracy corrections, embedding config store integration fix
2. **2026-04-10 16:42** — Batch ingest (multi-URL endpoint + UI), empty-state onboarding on home page, schema refresh
3. **2026-04-10 12:55** — Lint auto-fix expansion (orphan/stale/empty), provider constants consolidation, UI bug sweep

All three were polish/bug-fix sessions. No new major features in the last ~12 hours.

## Source Architecture

```
src/lib/           (14 modules, ~3,800 lines)
  ingest.ts         636  — URL fetch, HTML extraction, chunking, LLM wiki page generation
  query.ts          541  — BM25 + vector search, context building, LLM answer synthesis
  wiki.ts           426  — filesystem ops, index management, log, cross-referencing
  lint.ts           408  — 5 lint checks including LLM contradiction detection
  embeddings.ts     366  — vector store, embed/search, cosine similarity
  config.ts         353  — JSON config persistence, env var detection, provider resolution
  lifecycle.ts      326  — unified write/delete pipeline (index, log, embedding, cross-ref)
  frontmatter.ts    267  — YAML frontmatter parser/serializer (regex-based, no library)
  llm.ts            182  — provider-agnostic LLM calls (text + streaming)
  raw.ts            125  — raw source save/list/read
  types.ts           74  — shared interfaces
  providers.ts       46  — provider constants (client-safe, no Node.js imports)
  export.ts          27  — Obsidian wikilink conversion
  citations.ts       21  — citation slug extraction

src/app/           (18 pages + 13 API routes, ~3,450 lines)
  page.tsx           95  — home/dashboard
  ingest/           513  — ingest form with preview workflow
  query/            329  — Q&A with streaming + save-to-wiki
  lint/             295  — health check with auto-fix
  settings/         544  — provider/model/key configuration
  wiki/              23  — index wrapper (delegates to WikiIndexClient)
  wiki/[slug]/      118  — page view
  wiki/[slug]/edit/  44  — editor wrapper
  wiki/graph/       307  — force-directed graph (canvas)
  wiki/log/          31  — activity log viewer
  raw/               88  — raw source index
  raw/[slug]/        86  — raw source viewer
  api/ingest/        58  — single ingest endpoint
  api/ingest/batch/  91  — batch ingest endpoint
  api/query/         34  — non-streaming query
  api/query/stream/  80  — streaming query
  api/query/save/    41  — save answer to wiki
  api/lint/          18  — run lint
  api/lint/fix/     235  — auto-fix lint issues
  api/wiki/[slug]/  126  — DELETE + PUT wiki pages
  api/wiki/graph/    53  — graph data endpoint
  api/wiki/export/   72  — Obsidian zip export
  api/settings/     117  — GET/PUT config
  api/status/         6  — LLM key check
  api/raw/[slug]/    34  — raw source content

src/components/    (7 components, ~1,050 lines)
  BatchIngestForm   317  — multi-URL input with per-URL progress
  WikiIndexClient   235  — client-side search/filter for wiki index
  NavHeader         203  — responsive nav with mobile hamburger
  WikiEditor         96  — markdown textarea editor
  StatusBadge        84  — LLM config status indicator
  MarkdownRenderer   59  — react-markdown with wiki link handling
  DeletePageButton   55  — delete with confirmation

src/lib/__tests__/ (9 test files, ~5,440 lines)
  wiki.test.ts    1,324
  ingest.test.ts  1,193
  query.test.ts     998
  embeddings.test.ts 761
  lint.test.ts      632
  config.test.ts    334
  llm.test.ts       124
  export.test.ts     65
  smoke.test.ts       7
```

## Open Issues Summary

No open issues on GitHub. The issue queue is empty.

## Gaps & Opportunities

### Relative to llm-wiki.md founding vision

1. **No image/asset handling** — Source images are dropped during URL ingest. The vision mentions downloading images locally and having the LLM reference them. Not critical, but a gap.

2. **No "create page from scratch"** — The wiki layer is meant to be entirely LLM-authored, but there's no way to create a blank page or have the LLM generate a page on a topic without a source. The edit flow only updates existing pages (`PUT` returns 404 for new slugs).

3. **No batch vector rebuild** — Embeddings are generated incrementally on write but there's no "rebuild all embeddings" command. Switching embedding providers leaves the store stale.

4. **No concurrency safety** — Simultaneous writes could corrupt `index.md` or `log.md`. The vision doesn't require multi-user, but even a single user doing batch ingest + query simultaneously could race.

### Relative to YOYO.md goals (web app direction)

5. **No loading/error states** — No `loading.tsx` or `error.tsx` files for any route. Server components that do disk I/O have no suspense boundaries.

6. **No pagination** — Wiki index, raw sources, and log render everything at once. Will degrade with hundreds of pages.

7. **Lint-fix business logic in API route** — `api/lint/fix/route.ts` is 235 lines of fix logic that should live in a library module, not an HTTP handler. Untestable in isolation.

8. **Duplicated utility helpers** — `formatSize()` appears in 2 files, `formatRelativeDate()` / `formatRelative()` in 2 more. Should be extracted to a shared utils module.

### Larger opportunities

9. **Import from Obsidian vault** — Export exists, but there's no import. Users who already have markdown notes can't bulk-load them.

10. **Contradiction auto-fix** — Lint detects contradictions but has no auto-fix. The journal has been noting this as a "maybe next" for 5+ sessions.

11. **Markdown preview in editor** — The editor is a plain textarea. The ingest preview page already has rendered/raw toggle — the editor should too.

12. **Log filtering** — The log page dumps raw markdown. No filtering by operation type, date range, or affected page.

13. **Keyboard shortcuts** — No Ctrl+Enter to submit queries, no Ctrl+S in editor.

## Bugs / Friction Found

No bugs in the current build. All tests pass, all lint clean.

**Minor friction / code smells:**

1. **`source_count` stored as string** in frontmatter — parsed with `Number.parseInt()` defensively in 3 separate locations. The frontmatter parser treats all values as strings; this creates a recurring pattern of "parse number from string" at every read site.

2. **`listWikiPages()` reads every page from disk** on every call — called multiple times per request (ingest calls it for cross-referencing, then lifecycle calls it for index update). No caching layer. Fine at current scale but will be the first bottleneck.

3. **Sync file I/O for config** — `loadConfigSync()` uses `readFileSync` with a 5s cache. Acknowledged in code comments as deliberate for hot-path provider detection.

4. **`eslint-disable` in graph page** — `react-hooks/exhaustive-deps` suppression for color scheme effect.

5. **Non-null assertions in `llm.ts`** — `creds.model!` and `creds.apiKey!` after provider guard. Safe but not type-narrowed.

6. **Provider detection logic repeated** across `detectEnvProvider()`, `getEffectiveProvider()`, `getEffectiveSettings()`, and `getResolvedCredentials()` in config.ts. Adding a new provider means touching all four.
