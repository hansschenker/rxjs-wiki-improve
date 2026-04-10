# Assessment — 2026-04-10

## Build Status
**All green.** `pnpm build` succeeds (18 routes, all static/dynamic correctly categorized). `pnpm test` passes 338 tests across 8 test files. `pnpm lint` (eslint) clean — zero warnings.

## Project State
The app implements all four pillars from the founding vision:

| Feature | Library | API Route(s) | UI Page | Status |
|---------|---------|-------------|---------|--------|
| **Ingest** | `ingest.ts` (580 LOC) | `POST /api/ingest` | `/ingest` | Full: URL fetch, HTML→markdown, chunked LLM, frontmatter, cross-refs |
| **Query** | `query.ts` (541 LOC) | `POST /api/query`, `/api/query/stream`, `/api/query/save` | `/query` | Full: BM25 + vector hybrid search (RRF), streaming responses, save-to-wiki |
| **Lint** | `lint.ts` (408 LOC) | `POST /api/lint` | `/lint` | Full: orphans, stale, empty, missing cross-refs, LLM contradiction detection |
| **Browse** | `wiki.ts` (426 LOC) | `GET/PUT/DELETE /api/wiki/[slug]`, `/api/wiki/graph`, `/api/wiki/export` | `/wiki`, `/wiki/[slug]`, `/wiki/[slug]/edit`, `/wiki/graph`, `/wiki/log`, `/raw`, `/raw/[slug]` | Full: index with search/filter, page view, edit, delete, graph view, raw source browsing, Obsidian export |

**Supporting infrastructure:**
- `lifecycle.ts` (326 LOC) — Unified write/delete pipeline (the "one function to rule them all" for page mutations)
- `embeddings.ts` (308 LOC) — Provider-agnostic vector store with JSON persistence, cosine similarity search
- `llm.ts` (149 LOC) — Multi-provider LLM abstraction (Anthropic, OpenAI, Google, Ollama via Vercel AI SDK)
- `frontmatter.ts` (267 LOC) — YAML frontmatter parser/serializer
- `raw.ts` (125 LOC) — Raw source file management
- `citations.ts` (21 LOC), `export.ts` (27 LOC), `types.ts` (57 LOC) — Utilities

**Components:** NavHeader (responsive, mobile hamburger), MarkdownRenderer (with SPA navigation for wiki links), WikiEditor, WikiIndexClient (search + tag filters), DeletePageButton

**Total codebase:** ~10,155 lines across src/ (including ~4,929 lines of tests)

## Recent Changes (last 3 sessions)
From the journal (git history is squashed in CI):

1. **2026-04-10 01:53** — Deduplicated summary extraction (ingest/query share one path), added `maxOutputTokens` config to `callLLM`, extracted `lifecycle.ts` from `wiki.ts`, added content chunking for long documents during ingest.

2. **2026-04-09 20:42** — Built embedding infrastructure (`embeddings.ts`), JSON vector store, wired into ingest (embed on write) and query (semantic search + BM25 via RRF). Added Obsidian export (zip with `[[wikilinks]]`).

3. **2026-04-09 17:00** — Mobile-responsive NavHeader, BM25 corpus stats dedup, extracted `citations.ts`, fixed frontmatter round-trip serialization bug, HTML entity decoding.

## Source Architecture
```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── ingest/route.ts       (48 LOC)
│   │   ├── lint/route.ts         (18 LOC)
│   │   ├── query/
│   │   │   ├── route.ts          (34 LOC)
│   │   │   ├── save/route.ts     (41 LOC)
│   │   │   └── stream/route.ts   (80 LOC)
│   │   ├── raw/[slug]/route.ts   (34 LOC)
│   │   └── wiki/
│   │       ├── [slug]/route.ts   (126 LOC)
│   │       ├── export/route.ts   (72 LOC)
│   │       └── graph/route.ts    (53 LOC)
│   ├── ingest/page.tsx           (246 LOC)
│   ├── lint/page.tsx             (165 LOC)
│   ├── query/page.tsx            (302 LOC)
│   ├── raw/
│   │   ├── page.tsx              (88 LOC)
│   │   └── [slug]/page.tsx       (86 LOC)
│   ├── wiki/
│   │   ├── page.tsx              (23 LOC)
│   │   ├── [slug]/
│   │   │   ├── page.tsx          (118 LOC)
│   │   │   └── edit/page.tsx     (44 LOC)
│   │   ├── graph/page.tsx        (252 LOC)
│   │   └── log/page.tsx          (31 LOC)
│   ├── page.tsx                  (60 LOC)  — Home
│   ├── layout.tsx                (24 LOC)
│   └── globals.css
├── components/
│   ├── NavHeader.tsx             (135 LOC)
│   ├── MarkdownRenderer.tsx      (59 LOC)
│   ├── WikiEditor.tsx            (96 LOC)
│   ├── WikiIndexClient.tsx       (235 LOC)
│   └── DeletePageButton.tsx      (55 LOC)
└── lib/
    ├── ingest.ts                 (580 LOC)
    ├── query.ts                  (541 LOC)
    ├── wiki.ts                   (426 LOC)
    ├── lint.ts                   (408 LOC)
    ├── lifecycle.ts              (326 LOC)
    ├── embeddings.ts             (308 LOC)
    ├── frontmatter.ts            (267 LOC)
    ├── llm.ts                    (149 LOC)
    ├── raw.ts                    (125 LOC)
    ├── types.ts                  (57 LOC)
    ├── export.ts                 (27 LOC)
    ├── citations.ts              (21 LOC)
    └── __tests__/                (~4,929 LOC across 8 files)
```

## Open Issues Summary
No open GitHub issues at this time. The project is entirely vision-driven.

## Gaps & Opportunities

### High-impact gaps (relative to founding vision + YOYO.md)

1. **No settings/config UI** — Users must set `ANTHROPIC_API_KEY`, `LLM_MODEL`, etc. via environment variables. There's no in-app way to configure providers, see which provider is active, or know if the LLM is even connected. The home page doesn't indicate API key status. This is the biggest barrier to the "anyone can use it" goal.

2. **No onboarding / empty-state UX** — A fresh install shows empty pages everywhere. No guided first-ingest experience, no "getting started" prompts. Users unfamiliar with the concept would be lost.

3. **No image/asset handling** — URL ingest drops all images from source HTML. The founding vision mentions image support (Obsidian Web Clipper, "Download attachments" workflow). SCHEMA.md lists this as a known gap.

4. **No human-in-the-loop diff review on ingest** — Wiki writes happen immediately. The founding vision emphasizes "I prefer to ingest sources one at a time and stay involved — I read the summaries, check the updates." There's no preview/approve step before the LLM output is committed to the wiki.

5. **No batch ingest** — The founding vision mentions "you could also batch-ingest many sources at once." Currently URL and text ingest are one-at-a-time only.

6. **Lint has no auto-fix** — Lint detects issues but doesn't offer to fix them. The journal entry from 2026-04-10 mentions "auto-fix suggestions" as a next step.

7. **No file upload** — Only paste-text and URL modes. No drag-and-drop, PDF, or file picker for raw sources.

### Medium-impact gaps

8. **No query history / recent queries** — Queries vanish into chat history. No way to see previous questions or re-run them.

9. **No vector store batch rebuild** — Embeddings are generated incrementally on write, but there's no way to rebuild the full vector index from existing pages (e.g., after switching embedding providers).

10. **No concurrency safety** — Simultaneous ingests could corrupt `index.md`, `log.md`, or `.vectors.json`. Documented in SCHEMA.md as a known gap.

11. **Hardcoded dark theme in NavHeader** — Uses `bg-gray-900` etc. while the rest of the app respects `prefers-color-scheme` via CSS variables. Visual inconsistency in light mode.

12. **No loading progress for ingest** — Long LLM calls (especially chunked multi-pass) show only "Processing..." with no indication of progress. Could be improved with streaming status updates.

### Lower-priority / future

13. **No auth / multi-user** — Listed as an open question in YOYO.md.
14. **No CLI tool** — The founding vision describes CLI tools as useful; YOYO.md asks "Web app vs CLI vs all three?"
15. **Silent error swallowing** — Many `catch {}` blocks across query, lint, lifecycle swallow errors without logging. Good for resilience, harder to debug.
16. **No retry/backoff** for LLM API calls.
17. **Full-body BM25 reads every page from disk on every query** — acknowledged as a bridge until vector search is mature.

## Bugs / Friction Found

1. **NavHeader theme mismatch** — NavHeader hardcodes `bg-gray-900`, `text-white`, `border-gray-800` while `globals.css` uses `prefers-color-scheme` CSS variables (`--background`, `--foreground`). In light mode, the nav will be a jarring dark bar against a white page. Not technically a bug (it looks intentional as a dark nav bar) but creates visual inconsistency.

2. **No indication of LLM provider status anywhere in the UI** — If no API key is configured, users will discover this only when they try to ingest/query and get a degraded or error response. The home page and nav give no signal.

3. **`fetchUrlContent` memory concern** — Reads full `response.text()` into memory before checking size. The `Content-Length` header pre-check is good but not guaranteed by all servers.

4. **Sequential chunk processing** — Chunked ingest processes LLM calls sequentially (each chunk depends on prior output). Expected but can be very slow for long documents with no user feedback.

5. **No eslint or type errors** — Build, lint, and all 338 tests pass cleanly. No regressions detected.
