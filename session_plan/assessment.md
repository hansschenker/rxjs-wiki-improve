# Assessment — 2026-04-12

## Build Status
**All green.** `pnpm build` compiles successfully (28 static/dynamic routes), `pnpm lint` passes with zero warnings, `pnpm test` passes all 485 tests across 12 test files in 3.3s.

## Project State
The app is a fully functional LLM Wiki web application implementing all four pillars from the founding vision:

- **Ingest** — URL fetch (Readability+linkedom), text paste, batch multi-URL, preview/review step, content chunking for long docs, cross-reference propagation, raw source archival
- **Query** — BM25 + optional vector search (RRF fusion), streaming responses, save-answer-to-wiki loop, query history persistence
- **Lint** — 5 checks (orphan-page, stale-index, empty-page, missing-crossref, contradiction), all with auto-fix, LLM-powered contradiction detection
- **Browse** — wiki index with search/tag filters, D3 force-directed graph view, backlinks UI, Obsidian export, raw source browsing, global full-text search, page CRUD (create/read/edit/delete)

Supporting infrastructure: multi-provider LLM via Vercel AI SDK (Anthropic/OpenAI/Google/Ollama), persistent settings UI, embedding layer with vector store, file locking, YAML frontmatter, error boundaries, mobile-responsive nav.

**~17,600 lines of TypeScript** across 70+ source files. 12 test files with 485 test cases covering core lib modules.

## Recent Changes (last 3 sessions)
From journal.md (sessions are roughly every 4 hours):

1. **2026-04-12 01:56** — Query history persistence, full-text global search upgrade, slugify consolidation
2. **2026-04-11 20:24** — Content-Type validation on URL fetch, lightweight wiki list endpoint, vector store file locking
3. **2026-04-11 16:29** — Streaming retry resilience for `callLLMStream`, backlinks UI on wiki pages, SCHEMA.md housekeeping

The project has been in a polish/hardening phase for the last ~6 sessions — no major new features, mostly robustness, UX polish, and paying down drift between code and docs.

## Source Architecture

```
src/                              17,625 lines total
├── lib/                           4,754 lines (core logic)
│   ├── ingest.ts          (652)  — URL fetch, HTML cleaning, chunking, LLM wiki generation
│   ├── wiki.ts            (570)  — filesystem ops, index, log, search, cross-refs
│   ├── query.ts           (536)  — BM25, RRF, context building, LLM synthesis
│   ├── embeddings.ts      (447)  — vector store, embed/search, provider-agnostic
│   ├── lint.ts            (408)  — 5 lint checks including LLM contradiction detection
│   ├── config.ts          (353)  — settings persistence, provider resolution
│   ├── lifecycle.ts       (327)  — unified write/delete pipeline with side effects
│   ├── llm.ts             (314)  — provider dispatch, retry, streaming
│   ├── lint-fix.ts        (307)  — auto-remediation for all 5 lint issue types
│   ├── frontmatter.ts     (267)  — custom YAML frontmatter parser/serializer
│   ├── query-history.ts   (129)  — query persistence
│   ├── raw.ts             (125)  — raw source CRUD
│   ├── constants.ts        (72)  — tunable magic numbers
│   ├── types.ts            (74)  — shared interfaces
│   ├── lock.ts             (61)  — in-process file locking
│   ├── providers.ts        (46)  — provider constants
│   ├── export.ts           (27)  — Obsidian wikilink conversion
│   ├── citations.ts        (21)  — citation slug extraction
│   └── slugify.ts          (18)  — kebab-case slug generation
│
├── lib/__tests__/                 7,102 lines (12 test files, 485 tests)
│   ├── wiki.test.ts     (1,613)
│   ├── ingest.test.ts   (1,298)
│   ├── embeddings.test.ts (993)
│   ├── query.test.ts      (998)
│   ├── lint.test.ts        (632)
│   ├── lint-fix.test.ts    (542)
│   ├── llm.test.ts         (357)
│   ├── config.test.ts      (334)
│   └── ... 4 smaller test files
│
├── app/                           4,374 lines (pages + API routes)
│   ├── api/               ~1,000 lines across 15 API routes
│   ├── ingest/page.tsx     (513)
│   ├── query/page.tsx      (505)
│   ├── settings/page.tsx   (616)
│   ├── lint/page.tsx       (317)
│   ├── wiki/graph/page.tsx (442)
│   └── ... 12 other pages/layouts
│
└── components/                    1,420 lines (8 components)
    ├── GlobalSearch.tsx     (339)
    ├── BatchIngestForm.tsx  (316)
    ├── WikiIndexClient.tsx  (249)
    ├── NavHeader.tsx        (215)
    └── ... 4 smaller components
```

## Open Issues Summary
**No open issues** — `gh issue list` returns an empty array. The project is currently without external direction from the community.

## Gaps & Opportunities

### High-value gaps relative to the founding vision (`llm-wiki.md`):

1. **"Important concepts mentioned but lacking their own page" lint check** — `llm-wiki.md` explicitly calls this out as a lint operation ("important concepts mentioned but lacking their own page"). Current lint checks structural issues but doesn't detect *conceptual* gaps. This is one of the most powerful features for a compounding wiki — the system itself identifies what knowledge it's missing.

2. **No image/asset handling** — sources lose their images on ingest. `llm-wiki.md` discusses downloading images locally and having the LLM reference them. This matters for research use cases.

3. **No "suggest sources" capability from lint** — `llm-wiki.md` says lint should flag "data gaps that could be filled with a web search." Current lint is structural-only; it doesn't suggest what to ingest next.

### High-value engineering gaps:

4. **No tests for `lifecycle.ts`** (327 lines) — the unified write/delete pipeline is the most critical mutation code and has zero direct tests. The delete path and `stripBacklinksTo` logic are completely untested.

5. **No tests for `frontmatter.ts`** (267 lines) — a custom YAML parser/serializer with no tests is a data corruption risk. Any edge case in frontmatter round-tripping silently mangles wiki pages.

6. **UI component monoliths** — `settings/page.tsx` (616 lines), `ingest/page.tsx` (513 lines), `query/page.tsx` (505 lines) are all monolithic "use client" pages mixing state, fetching, and rendering. No component-level tests exist.

7. **Accessibility gaps** — no skip-nav link, emoji status indicators lack screen reader text, `focus:outline-none` without replacement focus rings, `aria-pressed` missing on tag toggle buttons, Settings icon link lacks `aria-label`.

### Code quality items:

8. **Duplicated summary extraction regex** in `lint-fix.ts` (appears 3 times) — should reuse `extractSummary()` from `ingest.ts`.

9. **5 near-identical error boundary components** — could be one shared component accepting title/backHref props.

10. **Re-export indirection** in `ingest.ts` and `query.ts` — symbols re-exported for backward compat create a confusing import graph.

## Bugs / Friction Found

- **No bugs found** — build, lint, and all 485 tests pass cleanly.
- **No TODO/FIXME/HACK comments** in the codebase — known gaps are tracked in SCHEMA.md.
- The build output shows `tsconfig.tsbuildinfo` is checked into git (not harmful but unnecessary — it's a cache file that should be gitignored).
- `ollama-ai-provider-v2` is an unusual dependency name — may be a fork or community package that could drift from upstream. Worth monitoring.
- The project journal shows a pattern of closing sessions with "Next: maybe improve graph view with clustering, or tackle query re-ranking quality" — these items have been deferred for ~8 consecutive sessions, suggesting they're either low-value or blocked.
