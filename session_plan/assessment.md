# Assessment — 2026-04-09

## Build Status
All green. `pnpm build` compiles successfully (17 static/dynamic routes). `pnpm lint` clean. `pnpm test` passes 266 tests across 6 test files.

## Project State
The app is a functional Next.js 15 wiki builder implementing all four pillars from the founding vision:

**Ingest** — paste text or a URL, the app fetches (Readability + linkedom), saves to `raw/`, calls the LLM for a wiki page, writes to `wiki/`, updates the index, finds and cross-references related pages, and logs the operation. Fallback stub page when no LLM key.

**Query** — ask a question, the app scores pages via BM25 (full-body), optionally LLM-reranks, builds context from top pages, streams the answer token-by-token via Vercel AI SDK `streamText`, and extracts cited slugs. Users can save answers back to the wiki as new pages.

**Lint** — structural checks (orphans, stale index entries, empty pages, missing cross-refs) plus LLM-powered contradiction detection on BFS-clustered page groups. Results displayed by severity. Lint runs logged.

**Browse** — wiki index with search/tag filters/metadata pills, individual page view with markdown rendering, interactive D3 force-directed graph view, raw source browsing, activity log viewer, page editing, and page deletion.

**Cross-cutting** — multi-provider LLM support (Anthropic, OpenAI, Google, Ollama), YAML frontmatter on pages, mobile-responsive nav with hamburger menu, SPA navigation for wiki links, path-traversal protection, SCHEMA.md loaded at runtime into LLM prompts.

## Recent Changes (last 3 sessions)
All from 2026-04-09 (today's earlier sessions):

1. **17:00** — Mobile-responsive NavHeader, BM25 corpus stats deduplication, citations.ts extraction, frontmatter round-trip bug fix, HTML entity decoding
2. **13:07** — Streaming/non-streaming query consistency fix, module extraction (frontmatter.ts, raw.ts from wiki.ts), full-body BM25 scoring, SCHEMA.md gaps sweep
3. **09:00** — Streaming query responses via `/api/query/stream`, SCHEMA.md wired into lint and query system prompts

Recent work has been polish and refactoring rather than new features. The journal entries consistently flag two "next" items: **vector search** and **Obsidian export**.

## Source Architecture

**Total**: ~9,000 lines (5,066 production, ~3,962 test)

### Core library (`src/lib/` — 2,648 lines production)
| File | Lines | Role |
|------|-------|------|
| wiki.ts | 711 | Filesystem ops, unified write/delete pipeline, index, log, cross-refs |
| query.ts | 481 | BM25 search, LLM reranking, context building, answer generation |
| ingest.ts | 444 | URL fetch, content cleaning, LLM page generation, ingest orchestration |
| lint.ts | 408 | 5 structural checks + LLM contradiction detection |
| frontmatter.ts | 267 | Hand-rolled YAML frontmatter parser/serializer |
| llm.ts | 134 | Vercel AI SDK abstraction (generateText/streamText) |
| raw.ts | 125 | Raw source CRUD |
| types.ts | 57 | Shared interfaces |
| citations.ts | 21 | Citation slug extraction |

### Pages (`src/app/` — 1,873 lines)
- 10 page routes: home, ingest, query, lint, wiki index, wiki page, wiki edit, wiki graph, wiki log, raw index, raw page
- 8 API routes: ingest, query, query/stream, query/save, lint, wiki/[slug] (PUT/DELETE), wiki/graph, raw/[slug]

### Components (`src/components/` — 545 lines)
- NavHeader (135), WikiIndexClient (200), WikiEditor (96), MarkdownRenderer (59), DeletePageButton (55)

### Tests (`src/lib/__tests__/` — 3,962 lines)
- wiki.test.ts (1,324), ingest.test.ts (1,073), query.test.ts (814), lint.test.ts (632), llm.test.ts (112), smoke.test.ts (7)

## Open Issues Summary
No open issues on GitHub (the issues list is empty).

## Gaps & Opportunities

### High-priority (repeatedly flagged in journal)
1. **Vector search** — every journal entry since April 6 flags this as the next step. BM25 is explicitly a bridge. The founding vision's "CLI tools" section mentions `qmd` and proper search as a natural evolution. Would dramatically improve query relevance for larger wikis.
2. **Obsidian export** — flagged in last 5 journal entries. The founding vision centers Obsidian as the "IDE" for browsing wikis. An export feature (or compatible file structure) would bridge the web app to Obsidian users.

### Medium-priority (from SCHEMA.md known gaps)
3. **Image/asset handling** — URL ingest drops images from source HTML. The founding vision explicitly discusses downloading images locally and having the LLM reference them.
4. **Human-in-the-loop diff review** — wiki writes happen immediately with no preview/approval step. The vision mentions "I read the summaries, check the updates, and guide the LLM."
5. **Context window management** — no token counting; long pages may exceed provider limits silently. More providers = more varied limits.
6. **Concurrency safety** — no file locking; simultaneous ingests could corrupt `index.md` or `log.md`.

### Lower-priority (vision features not yet started)
7. **Batch ingest** — the vision mentions batch-ingesting many sources at once.
8. **Multiple output formats** — the vision mentions Marp slide decks, charts (matplotlib), canvas. Currently only markdown.
9. **Dataview-style dynamic queries** — the vision mentions Obsidian Dataview for querying frontmatter.
10. **Web search for gap-filling** — lint could suggest sources to look for, as mentioned in the vision.

### Architectural improvements
11. **Lifecycle-op consolidation** — learnings.md flags that `deleteWikiPage` still partially duplicates `writeWikiPageWithSideEffects` rather than sharing the full lifecycle pipeline. The journal noted acting on the shallow fix (adding "delete" to LogOperation) instead of the deep fix.
12. **Summary extraction duplication** — `saveAnswerToWiki()` in query.ts re-implements summary extraction instead of reusing `extractSummary()` from ingest.ts.
13. **No LLM retry/backoff** — a single API failure throws with no recovery.
14. **No rate limiting** — API routes have no throttling.

## Bugs / Friction Found

No build errors, lint warnings, or test failures. The codebase is clean.

Minor observations from code review:
- `extractCitedSlugs` uses `availableSlugs.includes()` (O(n) per lookup) instead of a Set — fine at current scale but will degrade
- No error boundary components — LLM failures or filesystem errors could show raw error screens to users
- The `findRelatedPages` function does keyword overlap scoring that could be expensive on large wikis (tokenizes every page's index entry on every ingest)
- Wiki pages are loaded entirely into memory for operations like graph building — no streaming or pagination for large wikis
