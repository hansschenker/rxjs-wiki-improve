# Assessment — 2026-04-09

## Build Status
**All green.** `pnpm build` succeeds (all routes compile), `pnpm lint` clean, `pnpm test` passes 243 tests across 6 test files.

## Project State
The app implements all four pillars from the founding vision (ingest, query, lint, browse) as a Next.js 15 web application with ~8,300 lines of TypeScript across 36 source files and ~3,600 lines of tests.

**Implemented features:**
- **Ingest** — paste text or URL → LLM generates wiki page → writes with frontmatter → updates index → cross-references related pages → appends to log. URL extraction via Readability + linkedom. System prompt loads SCHEMA.md conventions at runtime.
- **Query** — BM25 search over index (title + summary), LLM reranking, loads top pages as context, LLM generates cited answer. "Save answer to wiki" closes the loop back into the knowledge base.
- **Lint** — structural checks (orphans, stale index entries, empty pages, missing cross-refs) + LLM-powered contradiction detection across page clusters.
- **Browse** — wiki index with search/tag filters/metadata pills, individual page view with markdown rendering, interactive D3 force-directed graph view, raw source browsing, edit flow, delete flow, activity log viewer.
- **Multi-provider LLM** — Vercel AI SDK supporting Anthropic, OpenAI, Google, Ollama via env vars.
- **CRUD** — full create/read/update/delete for wiki pages with unified lifecycle pipeline (`writeWikiPageWithSideEffects` / `deleteWikiPage`).
- **YAML frontmatter** — title, slug, sources, created/updated timestamps on all pages.
- **NavHeader** — persistent navigation across all routes.

**Source architecture (by size):**
| File | Lines | Role |
|---|---|---|
| `src/lib/wiki.ts` | 1,084 | Core filesystem I/O, index, log, lifecycle pipeline |
| `src/lib/ingest.ts` | 428 | Ingest pipeline (text + URL) |
| `src/lib/query.ts` | 427 | BM25 search + LLM Q&A |
| `src/lib/lint.ts` | 399 | Health checks + contradiction detection |
| `src/lib/llm.ts` | 110 | Provider abstraction |
| `src/lib/types.ts` | 57 | Shared types |
| UI pages (10 routes) | ~1,300 | App router pages + components |
| API routes (7 endpoints) | ~350 | REST API layer |
| Components (5) | ~480 | NavHeader, MarkdownRenderer, WikiEditor, etc. |
| Tests (6 files) | 3,622 | 243 tests |

## Recent Changes (last 3 sessions)
From journal.md (all sessions on 2026-04-08 and 2026-04-09):

1. **2026-04-09 05:52** — BM25 ranking for query (replaced naive keyword prefilter), ingest UI shows all touched pages, runtime SCHEMA.md loading for ingest prompts.
2. **2026-04-09 01:29** — Raw source browsing UI, wiki index polish (search, tag filters, metadata pills from frontmatter), multi-provider LLM (Google + Ollama added).
3. **2026-04-08 01:50** — YAML frontmatter on ingested pages, edit flow (WikiEditor + PUT route), "delete" added to LogOperation enum.

Git shows a single squashed commit: `4c03510 yoyo: growth session wrap-up`

## Source Architecture
```
src/
├── app/
│   ├── page.tsx                    # Home with 4 feature cards
│   ├── ingest/page.tsx             # Ingest form (URL or text)
│   ├── query/page.tsx              # Q&A interface
│   ├── lint/page.tsx               # Lint results display
│   ├── wiki/
│   │   ├── page.tsx                # Wiki index (server component → client)
│   │   ├── [slug]/page.tsx         # Individual page view
│   │   ├── [slug]/edit/page.tsx    # Edit flow
│   │   ├── graph/page.tsx          # D3 force graph
│   │   └── log/page.tsx            # Activity log
│   ├── raw/
│   │   ├── page.tsx                # Raw sources index
│   │   └── [slug]/page.tsx         # Raw source view
│   └── api/
│       ├── ingest/route.ts         # POST ingest
│       ├── query/route.ts          # POST query
│       ├── query/save/route.ts     # POST save answer
│       ├── lint/route.ts           # POST lint
│       ├── wiki/[slug]/route.ts    # PUT edit, DELETE page
│       ├── wiki/graph/route.ts     # GET graph data
│       └── raw/[slug]/route.ts     # GET raw source
├── components/
│   ├── NavHeader.tsx
│   ├── MarkdownRenderer.tsx
│   ├── WikiEditor.tsx
│   ├── WikiIndexClient.tsx
│   └── DeletePageButton.tsx
└── lib/
    ├── wiki.ts                     # Core I/O + lifecycle
    ├── ingest.ts                   # Ingest pipeline
    ├── query.ts                    # Search + Q&A
    ├── lint.ts                     # Health checks
    ├── llm.ts                      # Provider abstraction
    ├── types.ts                    # Shared types
    └── __tests__/                  # 243 tests
```

## Open Issues Summary
**No open GitHub issues.** The repo has zero open issues at this time.

## Gaps & Opportunities

### High-Impact Gaps (relative to llm-wiki.md vision)

1. **No vector/embedding search** — Query search is BM25 on title+summary only. The founding vision mentions "[qmd] is a good option" for hybrid BM25/vector search. Full-text content is never searched. This is the most frequently mentioned "next" item in the journal (mentioned in 7+ sessions).

2. **No streaming LLM responses** — All LLM calls block until complete. Ingest and query can take 10-30 seconds with no feedback. Streaming would dramatically improve UX for all three LLM-powered operations.

3. **No context window management** — No token counting or context truncation. Large pages or many pages loaded for query/lint could exceed model limits silently, causing truncated or failed responses.

4. **No human-in-the-loop on ingest** — The vision emphasizes "I prefer to ingest sources one at a time and stay involved — I read the summaries, check the updates, and guide the LLM on what to emphasize." Currently ingest is fire-and-forget with no review/approval step before writing.

5. **SCHEMA.md not wired into lint/query prompts** — Only ingest loads SCHEMA.md at runtime (per the latest session). Lint and query system prompts still use hardcoded instructions. Learnings.md explicitly flags this as the next step.

6. **No image/asset handling** — URL ingest strips images. The vision mentions downloading images locally and having the LLM reference them.

### Medium-Impact Gaps

7. **No authentication** — All API endpoints are open. Any client can delete/edit pages. Local-first mitigates this but cloud deployment would be unsafe.

8. **No concurrency safety** — No file locking on index.md or log.md. Concurrent API requests could corrupt shared files.

9. **Stale SCHEMA.md** — "Known gaps" section lists 6 items, at least 3 of which are now resolved. The doc is drifting from reality.

10. **Raw sources not truly immutable** — `saveRawSource()` overwrites on re-ingest, violating the "immutable" contract in both llm-wiki.md and SCHEMA.md.

11. **Summary extraction duplicated** — `saveAnswerToWiki()` in query.ts has its own summary logic instead of reusing `extractSummary()` from ingest.ts.

12. **No export/Obsidian integration** — The vision uses Obsidian as the "IDE" for browsing. No export mechanism exists to bridge the web app and Obsidian.

### Lower-Priority Opportunities

13. **Batch ingest** — Vision mentions "batch-ingest many sources at once." Currently one-at-a-time only.
14. **Alternative output formats** — Vision mentions Marp slide decks, charts, canvas. Currently markdown only.
15. **Web search for gap filling** — Lint could suggest sources to fetch for data gaps.

## Bugs / Friction Found

1. **No bugs in build/lint/test** — all 243 tests pass, build is clean, lint is clean.

2. **Potential race condition** — `runPageLifecycleOp` re-reads the index to avoid clobbering but has no file-level locking. Two concurrent ingests could lose an index entry.

3. **readRawSource() is O(n)** — calls `listRawSources()` (which stats every file) just to find one source. Will degrade with many raw sources.

4. **Graph endpoint has no edge deduplication** — if page A links to page B twice, two edges are emitted.

5. **maxOutputTokens hardcoded to 4096** — not configurable, may be too low for long wiki pages or too high for simple queries. No per-operation tuning.

6. **fetchUrlContent reads full body before size check** — `Content-Length` check can be bypassed by servers that omit the header; the 5MB limit only catches compliant servers.

7. **BM25 scores only title+summary** — pages with poor/generic summaries but highly relevant body content will rank low, potentially missing the best results for a query.
