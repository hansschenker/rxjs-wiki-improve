# Assessment — 2026-04-06

## Build Status
- `pnpm build` — ✅ pass (Next.js 15.5.14, compiled in 5.4s)
- `pnpm test` — ✅ pass (9 tests in 2 files, 374ms)
- `pnpm lint` — ✅ pass (clean)

## Project State
The project has a working Next.js 15 app with the **ingest** pipeline implemented end-to-end. Here's what exists:

**Implemented:**
- **Ingest API** (`POST /api/ingest`) — accepts title + content, saves raw source, generates wiki page via Claude (with fallback stub when no API key), updates index, appends to log
- **Wiki filesystem layer** — read/write pages, index management, raw source storage, append-only log
- **Browse UI** — landing page (`/`), wiki index (`/wiki`), individual page view (`/wiki/[slug]`)
- **LLM integration** — Claude API wrapper via `@anthropic-ai/sdk` (claude-sonnet-4-20250514)
- **Tests** — 9 passing tests covering wiki.ts filesystem ops (roundtrips, index, log, raw source)

**Not implemented:**
- Query operation (ask questions against wiki pages, get cited answers)
- Lint operation (health-check: contradictions, orphans, missing cross-references)
- Ingest UI (no form to paste content — only API endpoint exists)
- Markdown rendering (wiki pages display as raw text in `<pre>`-style `whitespace-pre-wrap`)
- Cross-reference detection/linking between wiki pages
- URL ingestion (paste a URL, fetch & process)
- Graph view
- log.md viewing in the UI
- Search of any kind

## Recent Changes (last 3 sessions)
Only 1 session so far:
- **2026-04-06 07:46** — Bootstrap session: scaffolded Next.js 15 project, built core library (wiki.ts, llm.ts, types.ts, ingest.ts), API route, browse UI, tests. Single commit: `f4a7ddc use yoyo GitHub App + tag each growth session`

## Source Architecture
```
src/ (599 lines total)
├── app/
│   ├── api/ingest/route.ts     (42 lines) — POST handler for ingest
│   ├── globals.css              — Tailwind imports
│   ├── layout.tsx              (20 lines) — root layout
│   ├── page.tsx                (24 lines) — landing page
│   └── wiki/
│       ├── page.tsx            (44 lines) — wiki index listing
│       └── [slug]/page.tsx     (44 lines) — individual page view
└── lib/
    ├── __tests__/
    │   ├── smoke.test.ts        (7 lines) — vitest smoke test
    │   └── wiki.test.ts       (132 lines) — wiki.ts unit tests
    ├── ingest.ts               (97 lines) — ingest pipeline + slugify
    ├── llm.ts                  (36 lines) — Claude API wrapper
    ├── types.ts                (21 lines) — WikiPage, IndexEntry, IngestResult
    └── wiki.ts                (132 lines) — filesystem ops for wiki/raw/index/log
```

## Open Issues Summary
| # | Title | Labels |
|---|-------|--------|
| 1 | Bootstrap: scaffold the Next.js web app with ingest workflow | `agent-input` |

Issue #1 is largely addressed by the bootstrap session — the ingest workflow exists. Could be closed or refined.

## Gaps & Opportunities
Ordered by impact relative to the founding vision:

1. **Query operation** — The #1 missing core feature. Users should ask questions and get cited answers from wiki pages. This is the primary way users interact with a growing wiki. Need: API route, LLM prompt that reads index → relevant pages → synthesizes answer with citations, UI for asking questions.

2. **Ingest UI** — The ingest API exists but there's no web form. Users have no way to add content without curl. A simple form with title + textarea (and eventually URL paste) would make the app usable.

3. **Markdown rendering** — Wiki pages display as raw markdown text. Need a markdown→HTML renderer (e.g. `react-markdown` or `next-mdx-remote`) to render headings, links, lists, emphasis properly.

4. **Cross-reference linking** — The founding vision emphasizes "interlinked markdown files." Currently each ingest creates one isolated page. The ingest pipeline should detect entities/concepts mentioned in new content and update existing pages, and new pages should link to existing ones.

5. **Lint operation** — Health-check the wiki: find orphans, contradictions, missing pages for referenced concepts. Third core operation.

6. **URL ingestion** — Paste a URL, fetch the content (or use a readability parser), then run through ingest. Critical for practical use.

7. **Log viewer** — log.md exists on disk but isn't surfaced in the UI.

8. **Graph view** — Visualize wiki page relationships (mentioned in YOYO.md Browse feature).

9. **Search** — Even basic text search over index.md or page content.

## Bugs / Friction Found

1. **No markdown rendering** — `wiki/[slug]/page.tsx` uses `whitespace-pre-wrap font-mono` to display raw markdown. This works but is ugly and doesn't render links/formatting.

2. **Summary derivation in ingest is naive** — The index summary is derived from the first sentence of the *raw content* (`content.split(/[.\n]/)[0]`), not from the LLM-generated wiki page. This means the index summary may not reflect what the LLM actually wrote.

3. **No deduplication on re-ingest** — If the same title is ingested twice, the wiki page is overwritten but the index entry is not updated (the `!entries.some(...)` check prevents duplicate entries but also prevents updating the summary of an existing entry).

4. **Log format doesn't match llm-wiki.md convention** — The founding vision suggests `## [2026-04-02] ingest | Article Title` format with grep-parseable headings. Current format is `[ISO timestamp] Ingested "title" as slug` — functional but divergent.

5. **No `src/components/` directory** — YOYO.md mentions it but it doesn't exist yet. Not a bug, just an empty gap.

6. **No ingest UI means the app is demo-only** — Without a form, a user visiting the app has no way to add content.
