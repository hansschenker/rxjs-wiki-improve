# Assessment — 2026-04-09

## Build Status

- `pnpm install` — clean
- `pnpm build` — **pass** (Next.js 15.5.14 compiled in ~12s; 15 routes, all static or server-rendered as expected)
- `pnpm test` — **pass** (6 test files, 218 tests, ~1.3s)
- `pnpm lint` — **pass** (clean eslint output)

Green across the board.

## Project State

A working Next.js 15 app implementing all four pillars from the founding vision:

- **Ingest** (`src/lib/ingest.ts`, `POST /api/ingest`, `/ingest` UI) — accepts a URL or pasted text+title. URL path runs `@mozilla/readability` + `linkedom` for article extraction with a 5 MB / 15 s / 100k-char guardrail. Writes raw source → generates wiki page via LLM (or fallback stub if no key) → flows through the unified write pipeline. Re-ingesting the same slug preserves `created`, bumps `updated`, increments `source_count`.
- **Query** (`src/lib/query.ts`, `POST /api/query`, `/query` UI) — index-first search: tokenizes the question (stop-word filter), keyword-scores index entries, then asks the LLM to re-rank (falls back to keyword order on failure). Loads only top-10 pages (all pages when wiki ≤ 5). Returns markdown answer with citations extracted by regex. "Save answer to wiki" is wired up via `saveAnswerToWiki()` → `POST /api/query/save`.
- **Lint** (`src/lib/lint.ts`, `POST /api/lint`, `/lint` UI) — four structural checks run in parallel (orphan, stale-index, empty-page, missing-crossref using word-boundary matching) plus an LLM-powered contradiction check that builds BFS cross-reference clusters (≤5 pages each) and asks the LLM for conflicting claims per cluster. Appends a log entry every run.
- **Browse** (`/wiki`, `/wiki/[slug]`, `/wiki/[slug]/edit`, `/wiki/graph`, `/wiki/log`) — index list, per-page view with frontmatter metadata strip (updated date, source count, tag pills), `WikiEditor` component + `PUT /api/wiki/[slug]`, `DeletePageButton` + `DELETE /api/wiki/[slug]`, D3 force-simulation graph view, structured activity log reader.

Core library layer (`src/lib/wiki.ts`, 930 lines) owns all filesystem mutation: slug validation (path-traversal guards), YAML frontmatter parse/serialize (constrained subset, no YAML library), `writeWikiPageWithSideEffects` + `deleteWikiPage` both thin wrappers over `runPageLifecycleOp` — the shared 5-step pipeline (validate → mutate file → upsert/remove index → cross-ref / strip backlinks → append log). The lifecycle-op abstraction is the durable resolution to the "parallel write-paths drift" and "delete is a write-path too" learnings from `.yoyo/learnings.md`.

LLM layer (`src/lib/llm.ts`, 68 lines) talks to providers via Vercel AI SDK. Detects Anthropic → OpenAI via env vars; `LLM_MODEL` overrides the default model name. `hasLLMKey()` gates every LLM call site so the app degrades gracefully without a key.

## Recent Changes (last 3 sessions)

From `.yoyo/journal.md`:

1. **2026-04-08 — Edit flow, YAML frontmatter, CRUD round-out.** YAML frontmatter now written on ingest (title, slug, sources, timestamps). `WikiEditor` + PUT route lets users revise pages in-browser. Added "delete" variant to `LogOperation`.
2. **2026-04-07 13:05 — Delete flow, lint logging, refactor parallel write paths.** Delete endpoint + button + slug page integration. Lint passes now log. Extracted `writeWikiPageWithSideEffects` to consolidate the write-path dance. (Note: this session was still duplicated by `deleteWikiPage` hand-rolling the same pipeline — deep fix landed later via `runPageLifecycleOp`.)
3. **2026-04-07 01:50 — Bug squashing, SCHEMA.md, log format alignment.** Fixed stateful regex bug in graph route, empty-slug lint bug, saved query answers now emit cross-refs. Wrote `SCHEMA.md`. Aligned log format to `llm-wiki.md` spec + structured `/wiki/log` renderer.

Git log is currently just `c8ae818 remove redundant run-frequency gate — cron + concurrency already handle it` — the checkout appears shallow (only one commit visible). The journal is the real history.

## Source Architecture

```
src/lib/                   (core logic — ~2,140 lines)
  wiki.ts           930    filesystem ops, slug validation, frontmatter I/O,
                           runPageLifecycleOp, writeWikiPageWithSideEffects,
                           deleteWikiPage, index/log maintenance
  lint.ts           399    4 structural checks + LLM contradiction clustering
  ingest.ts         368    slugify, URL fetch+readability, extractSummary, ingest()
  query.ts          335    searchIndex (keyword+LLM), buildContext, query, saveAnswerToWiki
  llm.ts             68    Vercel AI SDK wrapper (Anthropic, OpenAI only)
  types.ts           42    WikiPage, IndexEntry, Ingest/Query/LintResult, LintIssue

src/app/                   (Next.js 15 App Router)
  page.tsx           60    home with 4 feature cards
  layout.tsx         24
  ingest/page.tsx   223    form UI for URL or text ingest
  query/page.tsx    233    question form + answer + save-to-wiki
  lint/page.tsx     165    issues grouped by severity
  wiki/page.tsx      61    index list (no search/filter)
  wiki/[slug]/page.tsx       118   page view + frontmatter metadata strip
  wiki/[slug]/edit/page.tsx   44   wraps WikiEditor
  wiki/graph/page.tsx        252   D3 force simulation
  wiki/log/page.tsx           31   structured log renderer

  api/ingest/route.ts             48
  api/query/route.ts              34
  api/query/save/route.ts         41
  api/lint/route.ts               18
  api/wiki/[slug]/route.ts       126   DELETE + PUT (frontmatter-preserving edit)
  api/wiki/graph/route.ts         53

src/components/
  NavHeader.tsx       70    sticky header, longest-prefix active-route matching
  MarkdownRenderer.tsx 59   react-markdown + remark-gfm + SPA nav for wiki links
  WikiEditor.tsx      96    body-only textarea editor (YAML stays server-side)
  DeletePageButton.tsx 55

src/lib/__tests__/   (6 files, 218 tests — all passing)
  wiki.test.ts, ingest.test.ts, query.test.ts, lint.test.ts, llm.test.ts, smoke.test.ts
```

## Open Issues Summary

`gh issue list --state open` → **empty.** The two historical issues (#1 bootstrap, #2 Vercel AI SDK migration) are both closed. There is no external community input this session — the vision in `YOYO.md` + `llm-wiki.md` + the "Known gaps" section of `SCHEMA.md` has to drive priorities.

## Gaps & Opportunities

Derived from `llm-wiki.md` vision, `YOYO.md` direction, and SCHEMA.md's "Known gaps" section.

### High-value gaps (vision-aligned)

1. **LLM provider narrowness.** `YOYO.md` advertises "multi-provider via Vercel AI SDK — Anthropic, OpenAI, Google, Ollama, etc." but `package.json` only installs `@ai-sdk/anthropic` and `@ai-sdk/openai`, and `llm.ts` only recognises those two env vars. The Vercel AI SDK abstraction is in place but the provider surface is half-delivered. Adding Google (`@ai-sdk/google`) and Ollama (`ollama-ai-provider` or similar) is a few-line change per provider and makes the "bring your own key" promise real.
2. **No raw-source browsing UI.** SCHEMA.md explicitly flags this. `raw/` is the immutable source of truth but the app never surfaces it — users can't see which sources produced which wiki pages, can't click through from a page to its origin. A `/raw` index + `/raw/[slug]` view would close the `source → wiki page` loop from the UI side.
3. **Browse UX is thin.** `/wiki/page.tsx` (61 lines) is a flat list: no search, no filter by tag, no sort, no pagination. With frontmatter already storing `tags`, `created`, `updated`, `source_count`, the data is there — the UI just needs to use it. A tag facet + client-side search box would immediately pay off.
4. **No lint → fix loop.** Lint reports issues but offers no way to act on them. For orphans the user has nothing to do; for missing-crossrefs the user has to hand-edit. An "auto-link" affordance on missing-crossref issues would make lint a closed loop rather than just a diagnostic.
5. **Schema-code drift on lint checks.** SCHEMA.md §Lint-checks lists a "stale — page has not been updated in a long time" check that doesn't exist in the code. The code has `stale-index` (index references a nonexistent file), which is different. Either implement the time-based staleness check (frontmatter `updated` makes this trivial now) or fix the schema.

### Medium-value gaps

6. **Ingest has no diff / preview step.** The user pastes content, clicks ingest, and a wiki page silently materialises with cross-refs rewriting other pages. There's no "here's what will happen" preview. SCHEMA.md lists "No human-in-the-loop diff review on ingest" as a known gap.
7. **No vector search.** Journal has mentioned this as "next" for 8+ sessions. At current scale (dev, small wikis) keyword+LLM rerank is probably fine, but the architectural groundwork (an embedding pass on ingest, a vector index in a local file) would unlock much better recall.
8. **Schema not wired into runtime prompts.** Each operation hardcodes its own prompt. SCHEMA.md flags this. A single shared "system persona" injected into every LLM call would keep output style consistent.
9. **Wiki index (`/wiki`) doesn't surface frontmatter.** The per-page view renders a nice metadata strip, but the index list shows only title + summary. Tag pills + updated date on the index would give at-a-glance scanability.
10. **No tag editor.** Tags live in frontmatter but there's no UI to view/edit them — they're purely a write-time artifact that the ingest pipeline sets to `[]`. Dead feature until something sets them.

### Small polish / consistency

11. Home page (`/`) and Wiki index page (`/wiki/page.tsx`) both build their own nav — the NavHeader already exists, some redundant in-page back-links could be retired.
12. `ingest.ts` still has a re-export shim (`export { findRelatedPages, updateRelatedPages } from "./wiki"`) documented as a backwards-compat workaround. A short cleanup sweep would consolidate imports.

## Bugs / Friction Found

- **Schema/code drift on the "stale" lint check** (described above). Not a bug per se — the code is consistent — but the docs lie. Anyone reading SCHEMA.md and the code side-by-side sees a mismatch.
- **`llm.ts` provider support vs. `YOYO.md` promise.** The env-var block in `hasLLMKey()` only checks `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`. Google / Ollama / etc. users would get a confusing "No LLM API key found" error despite the AI SDK supporting them. Closest thing to a real bug in the codebase.
- **Orphan tag feature.** Frontmatter supports `tags: [...]` and the per-page view renders pills, but no code path ever sets tags to anything other than `[]`. Users can't even add tags through the editor (it's body-only). It's a half-built feature waiting to be either finished or removed.
- **No tests for the PUT (edit) route.** The lifecycle pipeline is tested, and `writeWikiPageWithSideEffects` is exercised heavily, but the edit endpoint's frontmatter-merging logic is not covered by an integration test. Low risk but a notable gap given how much logic (title derivation from H1, summary stripping, `created` backfill, `updated` bump) lives there.
- **No real git history visible locally.** `git log` returns one commit (`c8ae818`); the 10+ sessions of journal entries have no corresponding commits in the working checkout. Either a shallow clone or a freshly re-baselined repo — not a bug, just an assessment limitation. The journal is authoritative for "what happened when".

Overall: the project is in **healthy shape** — all four pillars implemented, build green, 218 tests passing, recent sessions have been paying down architectural debt (lifecycle-op consolidation) rather than piling on new features. The highest-value next move is probably the thing the code *claims* to do but doesn't: finish the multi-provider LLM surface and/or give the browse UI the facets it needs to scale past ~20 pages.
