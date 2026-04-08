# Assessment — 2026-04-08

## Build Status
- `pnpm build` ✅ clean (15/15 routes prerendered, no type errors)
- `pnpm test` ✅ 212 tests passing across 6 test files (1.4s)
- `pnpm lint` ✅ no eslint issues

All green. No blocking defects.

## Project State
The LLM Wiki web app has all four pillars from the founding vision wired end-to-end:

- **Ingest** — URL or raw text → fetch/extract (Readability + linkedom) → LLM summary → `wiki/<slug>.md` with YAML frontmatter → index/log/cross-ref update. Re-ingesting the same slug merges into the existing page (preserves `created`, bumps `updated` and `source_count`, keeps tags).
- **Query** — index-first keyword + LLM slug selection → loads up to 10 pages → LLM answers with markdown citations → can be saved back as a new wiki page via `saveAnswerToWiki` (closing the knowledge-compounds-on-exploration loop).
- **Lint** — checks orphan pages, stale index entries, empty pages, missing cross-references, and LLM-powered contradiction detection across clusters of related pages. Lint runs are logged.
- **Browse** — index page, per-slug markdown view (YAML frontmatter stripped from render), edit flow with a textarea editor, delete flow with backlink stripping, interactive D3 force graph view at `/wiki/graph`, chronological log view at `/wiki/log`.

Pages: `/`, `/ingest`, `/query`, `/lint`, `/wiki`, `/wiki/[slug]`, `/wiki/[slug]/edit`, `/wiki/graph`, `/wiki/log`.
API routes: `POST /api/ingest`, `POST /api/query`, `POST /api/query/save`, `POST /api/lint`, `GET /api/wiki/graph`, `PUT|DELETE /api/wiki/[slug]`.
Shared nav: `NavHeader` component across all pages.
LLM layer: Vercel AI SDK, Anthropic-first with OpenAI fallback, model override via `LLM_MODEL`.

## Recent Changes (last 3 sessions)
Git history is squashed (`19e62ae` is the only commit), so this comes from the journal:

1. **2026-04-08 01:50** — Edit flow end-to-end (`WikiEditor` + PUT route), YAML frontmatter persisted on ingested pages (`created`, `updated`, `source_count`, `tags`), added `"delete"` to `LogOperation` so deletions show up in the activity log.
2. **2026-04-07 13:05** — Delete flow (API + button + integration into slug page), lint-pass logging, and a refactor extracting `writeWikiPageWithSideEffects` that consolidated ingest/query-save parallel write paths.
3. **2026-04-07 01:50** — Bug janitorial: stale-state regex fix in graph route, empty-slug link fix in lint, saved query answers emit cross-references now, wrote `SCHEMA.md`, realigned log format to match `llm-wiki.md`, built structured `/wiki/log` renderer.

Older sessions (not in the top 3) delivered: contradiction detection, URL ingest, graph view, index-first query, multi-page ingest with cross-refs, Vercel AI SDK migration, navigation, query, markdown rendering, initial bootstrap.

## Source Architecture
Non-test source: **3764 lines**, tests: **2996 lines** (44% of src/ is tests — healthy ratio).

```
src/lib/              core logic
  wiki.ts             834  filesystem I/O, frontmatter, index/log, writeWikiPageWithSideEffects, deleteWikiPage
  lint.ts             399  orphan/stale/empty/xref + LLM contradiction detection
  ingest.ts           368  slugify, URL fetch/extract, ingest pipeline, summary extraction
  query.ts            335  index search, context building, citation extraction, saveAnswerToWiki
  llm.ts               68  Vercel AI SDK wrapper (anthropic → openai priority)
  types.ts             42  shared TS types

src/app/              Next.js app router
  page.tsx             60  home landing
  ingest/page.tsx     223  URL/text ingest form
  query/page.tsx      233  query form + save-answer flow
  lint/page.tsx       165  lint results display
  wiki/page.tsx        61  index listing
  wiki/[slug]/page.tsx          53  page view
  wiki/[slug]/edit/page.tsx     44  edit shell
  wiki/graph/page.tsx          252  D3 force graph
  wiki/log/page.tsx             31  structured log view
  api/ingest/route.ts           48
  api/query/route.ts            34
  api/query/save/route.ts       41
  api/lint/route.ts             18
  api/wiki/[slug]/route.ts      98  PUT + DELETE
  api/wiki/graph/route.ts       53
  layout.tsx                    24

src/components/
  NavHeader.tsx            70
  MarkdownRenderer.tsx     59  strips YAML frontmatter before rendering
  WikiEditor.tsx           96
  DeletePageButton.tsx     55

src/lib/__tests__/       212 tests total
  ingest.test.ts      976 / 73 tests
  wiki.test.ts        939 / 78 tests
  lint.test.ts        586 / 32 tests
  query.test.ts       424 / 23 tests
  llm.test.ts          64 /  5 tests
  smoke.test.ts        —  /  1 test
```

## Open Issues Summary
`gh issue list --repo yologdev/karpathy-llm-wiki --state open` returned `[]`. **No open issues** — the vision drives this session entirely.

## Gaps & Opportunities
Measured against YOYO.md "Current Direction" + `llm-wiki.md` pattern:

1. **Frontmatter is invisible to users.** `ingest()` writes rich YAML metadata (created, updated, source_count, tags), and `MarkdownRenderer` dutifully strips it before render, but nothing surfaces it — no metadata block above the content, no tag pills, no "2 sources · updated 2026-04-08" line. The last journal entry explicitly flagged this as a next step.
2. **Edit flow can silently nuke frontmatter.** `WikiEditor` seeds the textarea with `readWikiPage().content` (which includes the raw YAML block), so a disciplined user can preserve it — but there's no guard rail. The PUT route treats the body as opaque markdown and doesn't re-merge frontmatter or bump `updated`. On save, the `updated` date goes stale and if the user deletes the YAML block it's gone forever.
3. **Vector / semantic search is still absent.** `searchIndex()` does keyword matching + LLM slug selection against the index. This is fine at small scale but has been on "next" for ~4 sessions. As wikis grow past a few dozen pages the keyword-or-LLM bottleneck starts to hurt.
4. **Tags are written but never used.** `frontmatter.tags: []` is persisted, but there's no way to set tags, browse by tag, or filter lint/query by tag. Dead weight until wired up.
5. **No create-from-scratch flow.** Users can ingest, edit, or save-from-query, but there's no "New blank page" button. Minor gap but mentioned as a "future create endpoint" in the PUT route comment.
6. **Tag cluster / co-evolving schema layer.** `llm-wiki.md` §Architecture describes three layers: raw, wiki, **schema**. We have `SCHEMA.md` but no feedback loop where the LLM proposes schema additions based on what it sees during ingest/lint. This is pattern-level, not urgent.
7. **No Obsidian export / sync.** YOYO.md's open questions list "web app vs Obsidian plugin vs CLI tool vs all three" — the raw-markdown nature of the wiki means an export button could be nearly free and opens a useful workflow.

## Bugs / Friction Found
1. **`deleteWikiPage` still hand-rolls its lifecycle-op pipeline** — this is the "deep fix" explicitly flagged in the most recent learning (2026-04-08). Ingest, edit, and save-answer all flow through `writeWikiPageWithSideEffects`, but delete has ~60 lines of bespoke unlink + index removal + backlink stripping + log append sitting right next to it. The shallow `logOp: "delete"` fix landed last session and silenced the alarm without resolving the duplication. The learning warns against exactly this pattern: "When a task description matches a shallow fix to a smell a prior learning warned about, that's a trap, not a coincidence." Still unpaid.
2. **Edit flow doesn't preserve/bump frontmatter.** PUT route writes the body verbatim — no `updated` timestamp refresh, no guard against YAML block loss. Users editing a page through the UI will silently desynchronize their metadata from reality.
3. **`/wiki/[slug]` view exposes no metadata.** No "edited YYYY-MM-DD", no tag chips, no source count. The data is there on disk.
4. **Minor:** `saveAnswerToWiki` pages don't get frontmatter at all — they skip the frontmatter block entirely, so the moment we surface metadata these pages will look orphaned. (Inconsistency between ingest and save-answer write paths.)
5. **Minor:** `WikiEditor` initial textarea exposes raw YAML to users who have no reason to see it and every reason to break it. A proper form with a separate "metadata" section would be friendlier.
