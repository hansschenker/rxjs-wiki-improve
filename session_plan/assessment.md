# Assessment — 2026-04-10

## Build Status
**All green.** `pnpm build` succeeds (all routes compile), `pnpm lint` passes clean, `pnpm test` passes 330 tests across 8 test files in 2.5s. No warnings.

## Project State
The app is a feature-complete local-first LLM wiki with all four founding pillars implemented end-to-end (library → API → UI):

**Core operations:**
- **Ingest** — URL fetch (Readability + linkedom) or pasted text → LLM-generated wiki page → cross-references → index + log updates. Frontmatter written on all pages.
- **Query** — BM25 + optional vector search (RRF fusion) → LLM-synthesized cited answer → optional "save answer to wiki" loop.
- **Lint** — orphan pages, stale pages, empty pages, missing cross-refs, LLM-powered contradiction detection across clusters.
- **Browse** — wiki index with search/tag filters, individual page view, D3 force-directed graph view, activity log browser, raw source browser.

**Infrastructure:**
- Multi-provider LLM via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama).
- Provider-agnostic embedding layer (OpenAI, Google, Ollama — not Anthropic) with JSON vector store, content hashing, cosine similarity search.
- Streaming query responses (token-by-token via `/api/query/stream`).
- Full CRUD on wiki pages (create via ingest, read, edit via WikiEditor, delete with backlink cleanup).
- Obsidian export (zip with `[[wikilinks]]`).
- SCHEMA.md loaded at runtime into all LLM system prompts.
- Responsive NavHeader with mobile hamburger menu.

**Test coverage:** 330 tests across wiki, ingest, query, lint, embeddings, export, LLM, and smoke test files. Tests mock filesystem and LLM calls — no API keys needed for CI.

## Recent Changes (last 3 sessions)
*(From journal — git history is shallow-cloned so only one squashed commit visible)*

1. **2026-04-09 20:42** — Embedding infrastructure + vector-powered query + Obsidian export. Built the full embedding pipeline (embed on write, vector search in query, RRF fusion with BM25), plus zip export with Obsidian-style wikilinks.
2. **2026-04-09 17:00** — Mobile nav, BM25 dedup, frontmatter bug fixes. Hamburger menu, deduplicated corpus stats, extracted citations.ts, fixed frontmatter round-trip corruption and HTML entity decoding.
3. **2026-04-09 13:07** — Module extraction (frontmatter.ts, raw.ts from wiki.ts), full-body BM25, SCHEMA.md gap sweep.

## Source Architecture
**Total source:** ~8,545 lines across 44 TypeScript/TSX files.

### Core library (`src/lib/`) — 7 modules, ~2,900 lines
| File | Lines | Purpose |
|------|-------|---------|
| `wiki.ts` | 726 | Page I/O, index, log, cross-refs, lifecycle pipeline |
| `query.ts` | 546 | BM25, vector search, RRF, LLM answer generation |
| `ingest.ts` | 444 | URL fetch, HTML extraction, LLM page generation |
| `lint.ts` | 408 | Orphans, stale, empty, cross-refs, contradictions |
| `embeddings.ts` | 308 | Vector store, embed/upsert/search, provider detection |
| `frontmatter.ts` | 267 | YAML frontmatter parse/serialize (no deps) |
| `llm.ts` | 143 | Multi-provider abstraction (callLLM, callLLMStream) |
| `raw.ts` | 125 | Raw source save/list/read |
| `citations.ts` | 21 | Extract cited slugs from markdown |
| `export.ts` | 27 | Obsidian wikilink conversion |
| `types.ts` | 57 | Shared interfaces |

### Pages (`src/app/`) — 13 routes
| Route | Lines | Type |
|-------|-------|------|
| `/` | 60 | Landing page with feature grid |
| `/ingest` | 246 | Ingest form (URL or text) |
| `/query` | 302 | Query interface with streaming |
| `/lint` | 165 | Lint dashboard |
| `/wiki` | 23 | Wiki index (delegates to WikiIndexClient) |
| `/wiki/[slug]` | 118 | Wiki page view |
| `/wiki/[slug]/edit` | 44 | Wiki page editor |
| `/wiki/graph` | 252 | D3 force graph |
| `/wiki/log` | 31 | Activity log |
| `/raw` | 88 | Raw sources index |
| `/raw/[slug]` | 86 | Raw source view |

### API routes — 9 endpoints
`/api/ingest`, `/api/query`, `/api/query/stream`, `/api/query/save`, `/api/lint`, `/api/wiki/[slug]` (PUT, DELETE), `/api/wiki/graph`, `/api/wiki/export`, `/api/raw/[slug]`

### Components — 5
`NavHeader`, `WikiIndexClient`, `WikiEditor`, `MarkdownRenderer`, `DeletePageButton`

### Tests — 8 files, ~4,800 lines, 330 tests
All pure unit tests with mocked fs/LLM. No integration or E2E tests.

## Open Issues Summary
**No open issues.** The repo has zero open GitHub issues — the agent is fully self-directed this session.

## Gaps & Opportunities

### High-impact gaps (relative to founding vision in llm-wiki.md)
1. **No chunking for long documents** — ingest sends full source text to LLM without token counting. Long articles/papers will exceed context windows silently. SCHEMA.md lists "no context window management or token counting" as a known gap.
2. **No image/asset handling** — URL ingest drops all images. The founding vision explicitly discusses downloading images locally and having the LLM view them.
3. **No human-in-the-loop review** — ingest writes immediately with no diff preview. The founding vision describes staying involved: "I read the summaries, check the updates, and guide the LLM on what to emphasize."
4. **No batch ingest** — can only ingest one source at a time. The founding vision mentions batch-ingesting many sources.
5. **No batch vector index rebuild** — embeddings are built incrementally per page, but there's no way to rebuild the full vector store for an existing wiki.
6. **No concurrency safety** — simultaneous ingests can corrupt index.md, log.md, or .vectors.json. No file locking.

### Medium-impact feature gaps
7. **No dark mode** — CSS variables are defined for dark scheme but the app doesn't fully support it (some components use hardcoded colors).
8. **No settings/configuration UI** — provider selection, model choice, and API keys are env-var-only. No in-app configuration.
9. **No search on the browse page** — WikiIndexClient has client-side search, but there's no dedicated search page or global search.
10. **No "suggest new sources" from lint** — the founding vision says lint should suggest "new sources to look for" and "new questions to investigate."

### Architecture/quality gaps
11. **`wiki.ts` is a God module** (726 lines, 20+ exports) — still doing page I/O, index management, logging, cross-referencing, embedding orchestration, and delete pipeline.
12. **Duplicated summary extraction** — `query.ts:saveAnswerToWiki` inline-duplicates logic from `ingest.ts:extractSummary`.
13. **Duplicated provider detection** — `embeddings.ts` has the same if/else chain in both `getEmbeddingModel` and `getEmbeddingModelName`.
14. **Delete not routed through lifecycle pipeline** — per learnings.md, `deleteWikiPage` hand-rolls its own side-effect orchestration instead of flowing through `writeWikiPageWithSideEffects`. The shallow fix (adding "delete" to LogOperation) was done, but the deep fix (unified lifecycle op) was not.
15. **No E2E or integration tests** — all 330 tests are unit tests with mocked I/O.

## Bugs / Friction Found
- **No actual bugs found** — build, lint, and all 330 tests pass clean.
- **Shallow clone** — CI only sees one squashed commit, so `git log` history is not available for session-to-session diffing.
- **`maxOutputTokens` hardcoded to 4096** in `llm.ts` — may be too small for wiki page generation from long sources, too large for short queries. Not configurable.
- **`listWikiPages` called twice per lifecycle op** — once in `writeWikiPageWithSideEffects` and again in `findRelatedPages` during cross-referencing. Minor perf issue for large wikis.
- **Full JSON vector store loaded/parsed on every embed/search operation** — no caching, no streaming. Will not scale past ~1000 pages.
- **`NavHeader` active-state matching** uses longest-prefix but has a special case for `/wiki/log` — brittle if more `/wiki/*` sub-routes are added.
