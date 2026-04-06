# Assessment — 2026-04-06

## Build Status
All green: `pnpm build` ✅, `pnpm lint` ✅, `pnpm test` ✅ (3 files, 18 tests passing)

## Project State
The app has all four pillars from the founding vision implemented end-to-end (library → API route → UI page):

- **Ingest** (`/ingest`) — form to submit title + content, calls LLM for summary, writes wiki page + index + log
- **Browse** (`/wiki`, `/wiki/[slug]`) — server-rendered index page and individual wiki pages with markdown rendering
- **Query** (`/query`) — ask questions against wiki, LLM synthesizes answers with citations from wiki pages
- **Lint** (`/lint`) — health-check detecting orphan pages, stale index entries, empty pages, missing cross-references
- **Navigation** — persistent `NavHeader` across all pages
- **Markdown rendering** — `react-markdown` with GFM support and internal link rewriting

## Recent Changes (last 3 sessions)
All three sessions happened today (2026-04-06), bootstrapping the project from scratch:

1. **07:46 — Bootstrap**: Scaffolded Next.js 15 project, built core library (wiki.ts, llm.ts), ingest API + browse UI
2. **08:33 — Query + Ingest UI**: Built query operation, MarkdownRenderer, ingest form UI
3. **09:07 — Lint + Navigation**: Built lint system (4 checks), NavHeader, all four pillars now functional

Only 1 commit on main: `505505a update tech stack to Vercel AI SDK, add local dev instructions` — the previous session work was squash-merged or is on a branch.

## Source Architecture
```
src/
├── app/
│   ├── layout.tsx              (24 lines) — root layout with NavHeader
│   ├── page.tsx                (18 lines) — static landing page
│   ├── globals.css             — Tailwind styles
│   ├── ingest/page.tsx         (153 lines) — ingest form (client component)
│   ├── query/page.tsx          (117 lines) — query interface (client component)
│   ├── lint/page.tsx           (165 lines) — lint health-check (client component)
│   ├── wiki/page.tsx           (52 lines) — wiki index (server component)
│   ├── wiki/[slug]/page.tsx    (43 lines) — wiki page viewer (server component)
│   └── api/
│       ├── ingest/route.ts     (42 lines) — POST handler
│       ├── query/route.ts      (34 lines) — POST handler
│       └── lint/route.ts       (18 lines) — POST handler
├── components/
│   ├── NavHeader.tsx           (50 lines) — sticky top nav
│   └── MarkdownRenderer.tsx    (36 lines) — markdown → React with link rewriting
└── lib/
    ├── types.ts                (42 lines) — shared TypeScript interfaces
    ├── wiki.ts                 (132 lines) — filesystem CRUD for wiki/raw/index/log
    ├── llm.ts                  (36 lines) — Anthropic Claude API wrapper
    ├── ingest.ts               (97 lines) — ingest pipeline orchestration
    ├── query.ts                (98 lines) — query with full-wiki context
    ├── lint.ts                 (190 lines) — 4 health checks
    └── __tests__/
        ├── smoke.test.ts       (7 lines)
        ├── wiki.test.ts        (132 lines) — 8 tests
        └── lint.test.ts        (185 lines) — 9 tests

Total: ~1,500 lines of application code
```

## Open Issues Summary
| # | Title | Labels |
|---|-------|--------|
| 2 | Migrate from @anthropic-ai/sdk to Vercel AI SDK for multi-provider support | `agent-input` |

This is the only open issue and it directly aligns with YOYO.md which specifies: *"Multi-provider via Vercel AI SDK (`ai` package) — supports Anthropic, OpenAI, Google, Ollama, etc."*

## Gaps & Opportunities

### High Priority (vision vs reality)
1. **LLM SDK migration** — Currently uses `@anthropic-ai/sdk` directly. YOYO.md specifies Vercel AI SDK (`ai` package) for multi-provider support. Open issue #2 requests exactly this. This is the single most impactful change: it unlocks OpenAI, Google, Ollama, and any other provider.
2. **No URL ingestion** — YOYO.md says "paste a URL or text" but only raw text ingestion exists. No URL fetching, no article extraction (no Readability/cheerio).
3. **No graph view** — YOYO.md vision includes "graph view" for browsing. Currently just a flat index list.
4. **No LLM-powered lint** — Lint only does structural checks (orphans, stubs, missing links). The vision calls for contradiction detection, stale claims — requires LLM calls.
5. **Query doesn't scale** — Loads entire wiki into context. Works for small wikis but will fail at ~100+ pages. Need index-based search or chunking.

### Medium Priority (code quality)
6. **Type duplication** — Client pages (ingest, query, lint) re-define response interfaces instead of importing from `types.ts`.
7. **No ingest/query/llm tests** — Only wiki.ts and lint.ts have tests. Core pipeline is untested.
8. **No streaming** — Query and ingest wait for full LLM response. Streaming would improve UX significantly.
9. **LLM client instantiation** — Creates a new `Anthropic()` client on every call instead of reusing.

### Lower Priority (polish)
10. **Landing page is bare** — Just a title and description, no onboarding guidance or quick-start.
11. **No dark/light theme consistency** — NavHeader uses hardcoded `bg-gray-900`.
12. **No error boundaries** — Client components catch errors in state but no React error boundaries.
13. **No concurrency protection** — Concurrent ingests could corrupt `index.md` or `log.md`.

## Bugs / Friction Found
- **No actual bugs** — build, lint, and all tests pass cleanly.
- **YOYO.md says Vercel AI SDK but code uses @anthropic-ai/sdk** — the doc was updated but the code wasn't migrated yet.
- **Slug collision on re-ingest** — ingesting with the same title overwrites the page but leaves a duplicate index entry (index append-only, no dedup).
- **Summary extraction is fragile** — `ingest.ts` splits on first `.` or `\n` which will produce bad summaries for content starting with abbreviations ("Dr. Smith..." → summary = "Dr").
- **MarkdownRenderer only rewrites `.md` links** — wiki-style `[[page]]` links or relative links without `.md` extension won't work.
