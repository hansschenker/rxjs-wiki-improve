# Assessment — 2026-04-09

## Build Status
**Pass.** `pnpm build` succeeds (17 routes, all static/dynamic correctly categorized). `pnpm test` passes — 248 tests across 6 test files, 2.01s runtime.

## Project State
The app implements all four pillars from the founding vision:

**Ingest** — URL or text → raw source saved → LLM generates wiki page → cross-references updated → index updated → log appended. Multi-provider LLM support (Anthropic, OpenAI, Google, Ollama). Graceful degradation without API key. SCHEMA.md loaded at runtime into prompts.

**Query** — BM25 scoring + LLM reranking → context selection → streaming LLM answer with citations. Save-to-wiki flow closes the knowledge loop. Streaming via `/api/query/stream` with fallback to non-streaming.

**Lint** — Structural checks (orphans, stale index, empty pages, missing cross-refs) + LLM-powered contradiction detection via cluster analysis. Results displayed by severity.

**Browse** — Wiki index with search/tag filters/metadata pills, individual page view with MarkdownRenderer, D3 force-directed graph view, raw source browsing, activity log view. Full CRUD: create (ingest), read (browse), update (edit with WikiEditor + PUT), delete (with backlink cleanup).

**Infrastructure** — Unified lifecycle pipeline (`runPageLifecycleOp`) for all mutations. YAML frontmatter on pages. NavHeader with active-link highlighting. Path traversal protection. Custom BM25 implementation.

### Route inventory
| Route | Type | Purpose |
|-------|------|---------|
| `/` | Page | Home with feature cards |
| `/ingest` | Page | Ingest form (text/URL) |
| `/query` | Page | Query with streaming |
| `/lint` | Page | Health check UI |
| `/wiki` | Page | Wiki index (search/filter) |
| `/wiki/[slug]` | Page | Individual page view |
| `/wiki/[slug]/edit` | Page | Edit page |
| `/wiki/graph` | Page | D3 force graph |
| `/wiki/log` | Page | Activity log |
| `/raw` | Page | Raw source index |
| `/raw/[slug]` | Page | Individual raw source |
| `/api/ingest` | API | POST ingest |
| `/api/query` | API | POST query |
| `/api/query/stream` | API | POST streaming query |
| `/api/query/save` | API | POST save answer |
| `/api/wiki/[slug]` | API | PUT edit, DELETE |
| `/api/wiki/graph` | API | GET graph data |
| `/api/lint` | API | POST lint |
| `/api/raw/[slug]` | API | GET raw source |

### Line counts (top files)
- `wiki.ts`: 1084 lines (god module — I/O, frontmatter, indexing, lifecycle)
- `ingest.ts`: 428 lines
- `query.ts`: 467 lines
- `lint.ts`: 408 lines
- `llm.ts`: 134 lines
- Tests: ~3,770 lines total across 6 files (248 tests)
- UI components: ~481 lines across 5 components
- Pages: ~1,478 lines across 11 pages
- API routes: ~395 lines across 8 routes
- **Total source**: ~8,281 lines

## Recent Changes (last 3 sessions)
All from 2026-04-09 (the only commit visible is a squashed `yoyo: growth session wrap-up`):

1. **Session 09:00** — Streaming query responses (new `/api/query/stream` route with Vercel AI SDK `streamText`, client-side token-by-token rendering), updated SCHEMA.md known-gaps, wired SCHEMA.md into lint and query system prompts so all three LLM operations load page conventions at runtime.

2. **Session 05:52** — BM25 ranking (replaced keyword prefilter with proper BM25 scoring with corpus stats), ingest UI now surfaces all touched pages (new + cross-ref-updated), ingest system prompt loads SCHEMA.md at runtime.

3. **Session 01:29** — Raw source browsing UI at `/raw` and `/raw/[slug]`, wiki index polish (search, tag filters, metadata pills from frontmatter), multi-provider LLM support expanding to Google and Ollama via Vercel AI SDK.

## Source Architecture

```
src/
├── lib/                     # Core logic (2,578 lines)
│   ├── wiki.ts              # 1,084 — filesystem ops, frontmatter, index, lifecycle
│   ├── query.ts             #   467 — BM25, context selection, LLM answer
│   ├── ingest.ts            #   428 — URL fetch, HTML clean, LLM page gen
│   ├── lint.ts              #   408 — structural + contradiction checks
│   ├── llm.ts               #   134 — multi-provider LLM facade (AI SDK)
│   ├── types.ts             #    57 — shared interfaces
│   └── __tests__/           # 3,770 lines, 248 tests
│       ├── wiki.test.ts     # 1,287
│       ├── ingest.test.ts   # 1,051
│       ├── query.test.ts    #   683
│       ├── lint.test.ts     #   632
│       ├── llm.test.ts      #   112
│       └── smoke.test.ts    #     7
├── components/              # 481 lines
│   ├── WikiIndexClient.tsx  #   200 — index with search/filter
│   ├── WikiEditor.tsx       #    96 — edit form
│   ├── NavHeader.tsx        #    71 — sticky nav
│   ├── MarkdownRenderer.tsx #    59 — markdown display with wiki links
│   └── DeletePageButton.tsx #    55 — delete with confirmation
└── app/                     # 1,873 lines (pages + API routes)
    ├── page.tsx             #    60 — home
    ├── query/page.tsx       #   297 — query UI with streaming
    ├── ingest/page.tsx      #   246 — ingest form
    ├── lint/page.tsx        #   165 — lint results
    ├── wiki/               
    │   ├── page.tsx         #    23 — index wrapper
    │   ├── [slug]/page.tsx  #   118 — page view
    │   ├── [slug]/edit/     #    44 — edit page
    │   ├── graph/page.tsx   #   252 — D3 graph
    │   └── log/page.tsx     #    31 — log view
    ├── raw/                 
    │   ├── page.tsx         #    88 — raw index
    │   └── [slug]/page.tsx  #    86 — raw source view
    └── api/                 #   395 lines across 8 routes
```

Key dependencies: Next.js 15, Vercel AI SDK (`ai` + provider packages), `@mozilla/readability` + `linkedom` for URL extraction, `react-markdown` + `remark-gfm` for rendering, D3 (loaded dynamically in graph page).

## Open Issues Summary
**No open issues.** `gh issue list` returns an empty array. The project is currently driven by the founding vision gap analysis rather than community requests.

## Gaps & Opportunities

### High-value gaps (vision → reality)

1. **No vector search** — BM25 indexes title+summary only, not full page body. The founding vision mentions "proper search" as the wiki grows, and SCHEMA.md lists this as the top priority gap. Every journal entry since April 6 has flagged "vector search" as the next step.

2. **No image/asset handling** — URL ingest drops images entirely. The founding vision explicitly covers image support with Obsidian integration patterns.

3. **No human-in-the-loop review** — Ingest writes immediately with no diff preview. The founding vision says "I prefer to ingest sources one at a time and stay involved — I read the summaries, check the updates, and guide the LLM on what to emphasize."

4. **No token counting / context window management** — Long pages or large context selections could silently exceed provider limits.

5. **No Obsidian export** — The founding vision is built around Obsidian as the reading IDE. No export/sync to Obsidian vault format.

6. **No concurrency safety** — Simultaneous writes to `index.md`/`log.md` could corrupt. Single-user mitigates this but doesn't eliminate it.

### Medium-value opportunities

7. **Stale SCHEMA.md** — "No streaming LLM responses" is listed as a known gap but streaming IS implemented. The schema and reality have drifted.

8. **wiki.ts god module** — At 1084 lines handling 7+ concerns, this should be split (frontmatter, lifecycle, index, log, cross-refs, etc.).

9. **BM25 full-body indexing** — Even without vector search, BM25 could be improved to index full page content rather than just title+summary.

10. **Streaming vs non-streaming source semantics** — Streaming sends loaded page slugs as "sources"; non-streaming sends cited page slugs. Users see different source lists depending on which path ran.

11. **Batch ingest** — The founding vision mentions batch-ingesting many sources at once. Current UI is single-source only.

12. **File upload** — Ingest only accepts text or URLs. No file upload (PDFs, markdown files, etc.).

### Lower-priority polish

13. **No pagination** for wiki index (reads all frontmatter on every load).
14. **No rate limiting** on API endpoints.
15. **Duplicate summary extraction** in `saveAnswerToWiki` vs `extractSummary` in ingest.
16. **Sequential I/O in lint** — `checkMissingCrossRefs` reads pages one-by-one.
17. **NavHeader `/wiki/log` special-casing** is fragile.

## Bugs / Friction Found

1. **SCHEMA.md stale gap** — Line 163-164: "No streaming LLM responses — all `callLLM()` calls block until the full response is returned." This is factually wrong — `callLLMStream` exists and the query page uses it. The schema hasn't been updated to reflect the streaming work from the 09:00 session.

2. **No actual bugs in build/test** — 248 tests pass, build succeeds, no type errors or lint warnings.

3. **Semantic inconsistency in sources** — When streaming, the query response header `X-Wiki-Sources` contains all pages loaded into context. When non-streaming, `query()` runs `extractCitedSlugs()` to return only actually-cited pages. The save-to-wiki flow (only available on non-streaming) correctly uses cited sources, but the UI display differs between paths.

4. **`maxOutputTokens: 4096` hardcoded** — This could truncate long wiki pages on generation. Not configurable via env var.

5. **God module risk** — `wiki.ts` at 1084 lines is the most likely source of future merge conflicts and comprehension overhead. Every feature touches it.
