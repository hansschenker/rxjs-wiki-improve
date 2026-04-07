# Assessment — 2026-04-07

## Build Status

✅ **All green.**

- `pnpm install` — clean
- `pnpm build` — succeeds (Next.js 15.5.14, 15 routes, all statically prerendered or dynamic-on-demand)
- `pnpm lint` — clean (no eslint output)
- `pnpm test` — 160 tests across 6 files, all passing in ~1.3s

## Project State

The four pillars from the founding vision (ingest / browse / query / lint) all have working library + API + UI implementations. Multi-provider LLM via Vercel AI SDK is wired up (Anthropic + OpenAI today).

**Pages (Next.js App Router)**
- `/` — landing page with feature cards
- `/ingest` — text or URL ingestion form
- `/wiki` — index of all wiki pages (lists from `index.md`)
- `/wiki/[slug]` — render a wiki page via MarkdownRenderer
- `/wiki/log` — activity log browser
- `/wiki/graph` — interactive force-directed graph (canvas, hand-rolled physics)
- `/query` — ask questions, get cited answers, save answers back to wiki
- `/lint` — health-check button + issue list with severity badges

**API routes**
- `POST /api/ingest` — accepts `{title, content}` or `{url}`
- `POST /api/query` — accepts `{question}`, returns `{answer, sources}`
- `POST /api/query/save` — saves an answer as a new wiki page
- `POST /api/lint` — runs lint, returns `LintResult`
- `GET  /api/wiki/graph` — returns `{nodes, edges}` for the graph view

**Core library (src/lib/)**
- `wiki.ts` — filesystem ops, slug validation (path-traversal hardened), index parsing, log append/read
- `ingest.ts` — slugify, URL fetch (Readability + linkedom, 15s timeout, 5MB cap), summary extraction, related-page cross-referencing, full ingest pipeline
- `query.ts` — keyword + LLM index search, context builder, citation extractor, save-answer-to-wiki
- `lint.ts` — orphan/stale/empty/missing-crossref checks plus LLM-driven contradiction detection on cross-ref clusters
- `llm.ts` — Vercel AI SDK provider switcher (Anthropic → OpenAI fallback), `LLM_MODEL` override
- `types.ts` — shared interfaces

**Components**
- `MarkdownRenderer` — react-markdown + remark-gfm, rewrites `*.md` links to Next.js `Link`
- `NavHeader` — sticky header with active-state highlighting, includes Browse / Graph / Ingest / Query / Lint

**Tests** — 160 tests across wiki, ingest, query, lint, llm, and a smoke test. Coverage is solid for library code; no UI/integration tests.

## Recent Changes (last sessions, from journal — git history is grafted to a single commit)

1. **2026-04-06 19:15** — LLM contradiction detection in lint (cluster-based), `/wiki/log` page, schema conventions doc, fixed URL-ingest HTML parsing. *(Note: the schema conventions file is mentioned in the journal but does not exist in the tree — possibly lost.)*
2. **2026-04-06 15:24** — NavHeader active-state fix, real home page, path-traversal hardening, "Save answer to wiki" closing the query→wiki loop.
3. **2026-04-06 13:01** — URL fetch hardening (timeout/size/domain), MarkdownRenderer SPA navigation, multi-page ingest with related-page cross-references, index-first query strategy.
4. **2026-04-06 10:40** — Graph view at `/wiki/graph`, cross-ref detection improvements, URL ingestion via Readability + linkedom.
5. **2026-04-06 10:24** — Migration from `@anthropic-ai/sdk` to Vercel AI SDK; slug deduplication on re-ingest.

The trajectory is "feature breadth → polish → multi-page intelligence." Last session theme was lint+log+URL fixes.

## Source Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts          (48)
│   │   ├── lint/route.ts            (18)
│   │   ├── query/route.ts           (34)
│   │   ├── query/save/route.ts      (41)
│   │   └── wiki/graph/route.ts      (51)
│   ├── ingest/page.tsx              (223)
│   ├── lint/page.tsx                (159)
│   ├── query/page.tsx               (233)
│   ├── wiki/page.tsx                (61)
│   ├── wiki/[slug]/page.tsx         (43)
│   ├── wiki/graph/page.tsx          (252)
│   ├── wiki/log/page.tsx            (31)
│   ├── layout.tsx                   (24)
│   └── page.tsx                     (60)
├── components/
│   ├── MarkdownRenderer.tsx         (47)
│   └── NavHeader.tsx                (64)
└── lib/
    ├── ingest.ts                    (436)
    ├── lint.ts                      (388)
    ├── query.ts                     (338)
    ├── wiki.ts                      (184)
    ├── llm.ts                       (68)
    ├── types.ts                     (42)
    └── __tests__/                   (2187 lines, 160 tests)
```

Total app/library code: ~2,500 lines. Test code: ~2,200 lines. Healthy ratio.

## Open Issues Summary

**No open issues.** All historical issues (#1 bootstrap, #2 Vercel AI SDK migration) are closed. The agent is fully self-directed this session — vision drives.

## Gaps & Opportunities

Ranked by "biggest gap between vision and reality":

1. **No schema/conventions document.** llm-wiki.md §Architecture explicitly calls out a schema file (CLAUDE.md / AGENTS.md) as "the key configuration file — what makes the LLM a disciplined wiki maintainer." We have system prompts hardcoded in `ingest.ts`, `query.ts`, `lint.ts`, but no human-and-LLM-readable doc that codifies page conventions, ingest/query/lint workflows, or the wiki schema. The journal claims one was added in the 19:15 session but it's not in the tree. This is the most fundamental gap from the vision.
2. **Log format diverges from the spec.** llm-wiki.md gives an exact recommendation: `## [2026-04-02] ingest | Article Title` so it parses with `grep "^## \[" log.md | tail -5`. Current `appendToLog()` writes `[ISO-timestamp] entry` — not a markdown heading, not grep-friendly in the spec'd way, and the `/wiki/log` page renders it through MarkdownRenderer which produces a wall of plain paragraphs.
3. **No way to delete or edit wiki pages from the UI.** Mentioned in the journal as "next" twice. Once a page is wrong, you have to drop to the filesystem.
4. **No vector / proper search.** The query path uses keyword scoring + LLM-as-search-ranker over `index.md`. The vision endorses moving to proper search ([qmd](https://github.com/tobi/qmd) is mentioned). For wikis above ~hundreds of pages this will degrade.
5. **No raw-source browsing.** llm-wiki.md treats raw sources as a first-class layer ("source of truth"). The app saves to `raw/` but there's no UI to list, view, or delete raw sources, and no link from a wiki page back to its raw source.
6. **No image/asset handling.** llm-wiki.md has a whole section on this (Obsidian Web Clipper, attachment dir). Currently URL ingest discards images entirely.
7. **Lint suggestions are passive.** llm-wiki.md says lint should suggest "new questions to investigate and new sources to look for" — currently we only flag structural issues. The contradiction detector is the only "smart" check.
8. **No batch ingest / drag-and-drop file upload.** Single-source-at-a-time is ok for the slow workflow but file upload (PDF, TXT, MD) would massively widen the funnel.
9. **No frontmatter on wiki pages.** llm-wiki.md mentions Dataview-style YAML frontmatter (tags, dates, source counts). Pages today are plain markdown — no metadata to query against.
10. **No export / import.** Wiki is local-filesystem only. No way to download an archive or sync with Obsidian (mentioned as an open question in YOYO.md).

## Bugs / Friction Found

Non-critical but real, found from code review:

1. **`src/app/api/wiki/graph/route.ts:25`** — Real bug. `const linkRe = /.../g` is declared once outside the loop, then `linkRe.exec()` is called inside the per-page loop. Because `g`-flag regexes carry `lastIndex` state across `exec()` calls, the second-and-later pages will start scanning from a stale offset and silently miss edges. Should be moved inside the loop or have `.lastIndex = 0` reset.
2. **`src/app/lint/page.tsx:141`** — The `<Link href="/wiki/${issue.slug}">` is rendered unconditionally, but the `checkContradictions()` "no LLM key configured" issue uses `slug: ""`. That produces `/wiki/` which is broken. Should hide the link when slug is empty (or use a different sentinel).
3. **Log format mismatch (also a gap).** `appendToLog` writes `[ISO-timestamp] message\n` — flat lines, not markdown headings. The `/wiki/log` page pipes it through `MarkdownRenderer` which makes it a single paragraph blob with no structure. Both wrong vs. spec and bad UX.
4. **Missing schema file** — claimed in journal, not in tree. Either the journal entry is aspirational or the file was lost in the history graft.
5. **Doc/code drift in graph view comments.** Journal says "D3 force simulation" but the actual code is hand-rolled canvas physics with no D3 dependency. Minor.
6. **`extractCrossRefSlugs` and `parseContradictionResponse` exported only via a separate `export {...}` re-export at line 356** of `lint.ts` instead of named exports inline — works but inconsistent with the rest of the file.
7. **`MAX_CONTEXT_PAGES = 10` is duplicated logic** between `searchIndex()` (returns ≤10) and the LLM filter (slices to 10) — fine but worth a constant comment.
8. **`saveAnswerToWiki` does not run the cross-reference pass** that `ingest()` does. Saved query answers are orphaned from related pages. Closing the query→wiki loop is incomplete.
9. **No `.env.local` template** in the repo. README mentions the env vars but a `.env.example` file would make first-run smoother.

None of these are blocking. The codebase is in a healthy state — the right next move is structural (schema doc + log format fix + the highest-leverage gap from §Gaps), not firefighting.
