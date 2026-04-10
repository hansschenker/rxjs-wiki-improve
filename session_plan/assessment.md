# Assessment — 2026-04-10

## Build Status
✅ **All green.** `pnpm build` compiles successfully (22 static pages), `pnpm lint` (eslint) passes, `pnpm test` passes — 9 test files, 364 tests, 0 failures.

## Project State
The app implements all four pillars from the founding vision (ingest, query, lint, browse) end-to-end as a Next.js 15 web application:

**Ingest** — URL or text input → fetch/clean → LLM summarization → wiki page + index + cross-refs + log entry. Supports human-in-the-loop preview mode (review/edit/reject pages before commit). Long documents are chunked (~12K chars per chunk). Raw sources saved to `raw/`.

**Query** — BM25 + optional vector search (RRF fusion) → LLM synthesis with citations → streaming responses. Answers can be saved back to wiki as pages. Embedding support for OpenAI, Google, Ollama (not Anthropic — no embedding API).

**Lint** — Detects orphans, stale pages, empty pages, missing cross-references, and LLM-powered contradiction detection. Auto-fix implemented for `missing-crossref` issues only.

**Browse** — Wiki index with search/tag filters, individual page view with markdown rendering, interactive D3 force graph, raw source browsing, activity log, Obsidian export (zip with `[[wikilinks]]`).

**CRUD** — Create (ingest), Read (browse), Update (in-browser editor), Delete (with lifecycle cleanup).

**Settings** — In-browser provider/model/API key configuration persisted to JSON config file, with env var overrides.

**Providers** — Multi-provider via Vercel AI SDK: Anthropic, OpenAI, Google, Ollama. Graceful degradation without API key (deterministic fallback for ingest, "no LLM" notice for query/lint).

## Recent Changes (last 3 sessions)
1. **Settings config store + lint auto-fix** (2026-04-10 09:01) — JSON config persistence, settings UI page, lint auto-fix for missing cross-references, SCHEMA.md update.
2. **Ingest preview mode + dark theme fix + status indicator** (2026-04-10 05:54) — Two-phase ingest (generate → review → commit), dark mode respect, `/api/status` endpoint.
3. **Dedup, lifecycle extraction, content chunking** (2026-04-10 01:53) — Shared summary extraction, `lifecycle.ts` module extraction, `maxOutputTokens` for `callLLM`, content chunking for long docs.

## Source Architecture

```
src/ (12,790 lines total — 7,515 app + 5,275 tests)
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── ingest/route.ts        (58)    POST ingest
│   │   ├── lint/route.ts          (18)    POST lint
│   │   ├── lint/fix/route.ts      (129)   POST auto-fix
│   │   ├── query/route.ts         (34)    POST query
│   │   ├── query/stream/route.ts  (80)    POST streaming query
│   │   ├── query/save/route.ts    (41)    POST save answer
│   │   ├── raw/[slug]/route.ts    (34)    GET raw source
│   │   ├── settings/route.ts      (117)   GET/PUT settings
│   │   ├── status/route.ts        (6)     GET status
│   │   ├── wiki/[slug]/route.ts   (126)   DELETE/PUT wiki page
│   │   ├── wiki/export/route.ts   (72)    GET zip export
│   │   └── wiki/graph/route.ts    (53)    GET graph data
│   ├── ingest/page.tsx            (469)   Ingest form + preview
│   ├── lint/page.tsx              (264)   Lint dashboard
│   ├── query/page.tsx             (302)   Query + streaming UI
│   ├── settings/page.tsx          (556)   Provider config UI
│   ├── raw/page.tsx               (88)    Raw source index
│   ├── raw/[slug]/page.tsx        (86)    Raw source viewer
│   ├── wiki/page.tsx              (23)    Wiki index shell
│   ├── wiki/[slug]/page.tsx       (118)   Wiki page viewer
│   ├── wiki/[slug]/edit/page.tsx  (44)    Wiki page editor
│   ├── wiki/graph/page.tsx        (252)   D3 force graph
│   ├── wiki/log/page.tsx          (31)    Activity log
│   ├── page.tsx                   (62)    Home/dashboard
│   ├── layout.tsx                 (24)    Root layout
│   └── globals.css                        Tailwind + dark mode
├── components/
│   ├── NavHeader.tsx              (203)   Responsive nav w/ hamburger
│   ├── WikiIndexClient.tsx        (235)   Search/filter index
│   ├── WikiEditor.tsx             (96)    Edit form
│   ├── StatusBadge.tsx            (93)    LLM status indicator
│   ├── MarkdownRenderer.tsx       (59)    react-markdown wrapper
│   └── DeletePageButton.tsx       (55)    Delete confirmation
└── lib/
    ├── ingest.ts                  (636)   URL fetch, chunking, LLM ingest
    ├── query.ts                   (541)   BM25, RRF, LLM query
    ├── wiki.ts                    (426)   Filesystem ops, index, log
    ├── lint.ts                    (408)   All lint checks
    ├── config.ts                  (346)   Settings persistence
    ├── lifecycle.ts               (326)   Write/delete side-effects
    ├── embeddings.ts              (308)   Vector store, cosine search
    ├── frontmatter.ts             (267)   YAML frontmatter parse/serialize
    ├── llm.ts                     (182)   Provider-agnostic LLM calls
    ├── raw.ts                     (125)   Raw source CRUD
    ├── types.ts                   (74)    Shared interfaces
    ├── export.ts                  (27)    Obsidian link conversion
    ├── citations.ts               (21)    Citation slug extraction
    └── __tests__/                 (5,275) 9 test files, 364 tests
```

## Open Issues Summary
No open issues on GitHub (`gh issue list` returned `[]`).

## Gaps & Opportunities

### vs. YOYO.md Vision
The four core operations (ingest, query, lint, browse) are all implemented. The app is local-first with multi-provider support. The main remaining gaps from YOYO.md's vision:

1. **No image/asset handling** — URL ingest strips images. The founding vision mentions images explicitly and Karpathy suggests downloading them locally.
2. **No batch ingest** — Only one-at-a-time. The founding vision mentions batch-ingest with less supervision.
3. **Partial lint auto-fix** — Only `missing-crossref` can be auto-fixed. Orphans, empty pages, and contradictions require manual intervention.
4. **No concurrency safety** — Simultaneous ingests could corrupt `index.md` or `log.md`.

### vs. llm-wiki.md Founding Vision
5. **No Marp/slide deck output** — Vision mentions generating presentations from wiki content.
6. **No dynamic Dataview-style queries** — Vision mentions frontmatter-driven dynamic tables.
7. **No batch vector index rebuild** — Incremental embedding on write exists, but no full-corpus rebuild command.
8. **No web search integration** — Vision's lint section suggests finding new sources via web search to fill knowledge gaps.

### Quality & Polish
9. **Page component decomposition** — `settings/page.tsx` (556), `ingest/page.tsx` (469), `query/page.tsx` (302) are monolithic single-component files with many state variables. Should be decomposed into focused sub-components.
10. **Accessibility gaps** — No `role="alert"` on error messages, no `aria-pressed` on toggles, no focus trap in mobile nav, no `aria-live` on streaming regions, no `prefers-reduced-motion` media query for animations.
11. **Hardcoded constants scattered** — `DEFAULT_MODELS` duplicated between `config.ts` and `settings/page.tsx`, provider lists in 3 places, magic numbers for thresholds (empty page = 50 chars, BM25 params, chunk sizes, timeouts).
12. **No loading/empty states** — Some pages jump from blank to content with no skeleton or indicator.

## Bugs / Friction Found

### Bugs
- **`settings/page.tsx` line ~105: `embeddingModel` state never populated from API response** — On page load, the embedding model field is always blank even if previously saved. State setter is missing from `fetchSettings`.
- **`query/page.tsx` line ~90: No `AbortController` on streaming** — If user navigates away mid-stream, the `while(true)` reader loop continues calling `setResult` on an unmounted component (React state update warning, potential memory leak).
- **`query/page.tsx` line ~72: `JSON.parse(sourcesHeader)` with no try/catch** — Malformed `X-Wiki-Sources` header will throw unhandled error mid-stream.
- **`ingest/page.tsx` line ~460: "Ingest directly" button bypasses form validation** — `type="button"` skips HTML5 required-field checks.
- **Config cache race** — `saveConfig` nullifies `_configCache` after `fs.rename`, but between the rename and cache invalidation another request could read stale cache.
- **TOCTOU race in delete** — `deleteWikiPage` validates file existence, then `runPageLifecycleOp` calls `unlink` — file could be deleted by a concurrent request in between.

### Code Smells
- **Provider/model constants in 3 places** — `config.ts` `VALID_PROVIDERS`, `settings/page.tsx` `PROVIDERS` array, `settings/page.tsx` `providerLabel` map. Will drift.
- **Inconsistent model fallback** — `getEffectiveProvider` uses `DEFAULT_MODELS[provider] ?? provider` (line 196), `getResolvedCredentials` uses `DEFAULT_MODELS[provider] ?? null` (line 257). Different behavior for same logic.
- **Non-atomic index updates** — `listWikiPages()` → mutate → `updateIndex()` pattern in lifecycle.ts is vulnerable to lost updates under concurrency. (Documented in SCHEMA.md known gaps.)
