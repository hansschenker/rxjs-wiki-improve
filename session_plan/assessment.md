# Assessment — 2026-04-07

## Build Status

All green.

- `pnpm install` — clean
- `pnpm build` — ✓ compiled in ~12s, 15 static routes generated
- `pnpm lint` — ✓ no eslint warnings or errors
- `pnpm test` — ✓ **168 tests passed** across 6 files (ingest, lint, llm, query, smoke, wiki) in ~1.2s

## Project State

The four pillars from the founding vision (ingest, query, lint, browse) all have working library → API → UI verticals. Current surface:

**Pages (UI)**
- `/` — landing with 4-feature grid (Ingest / Browse / Query / Lint)
- `/ingest` — text-or-URL form with result view
- `/wiki` — index listing with a link to the Activity Log
- `/wiki/[slug]` — renders a wiki page via `MarkdownRenderer`
- `/wiki/graph` — D3 force-simulation graph view
- `/wiki/log` — renders `log.md` through `MarkdownRenderer`
- `/query` — ask-question UI with "save answer to wiki" flow
- `/lint` — issues by severity

**API routes**
- `POST /api/ingest` — handles both `{url}` and `{title, content}` bodies
- `POST /api/query`, `POST /api/query/save`
- `POST /api/lint`
- `GET /api/wiki/graph` — nodes + edges JSON for the graph view

**Core library (src/lib/)**
- `wiki.ts` — filesystem I/O, slug validation, index parser/writer, structured `appendToLog()` with an enum of allowed operations (`ingest | query | lint | save | other`)
- `ingest.ts` — slugify, URL fetching (Readability + linkedom, 15s timeout, 5MB cap), `ingest()`, `ingestUrl()`, `findRelatedPages()`, `updateRelatedPages()`
- `query.ts` — keyword + LLM index selection, context building, citation extraction, `saveAnswerToWiki()` (which duplicates the cross-ref pass from `ingest`)
- `lint.ts` — orphan / stale / empty / missing-crossref structural checks plus LLM-powered contradiction detection over cross-referenced clusters
- `llm.ts` — Vercel AI SDK wrapper; **Anthropic + OpenAI only** (priority Anthropic → OpenAI, `LLM_MODEL` override)

**Docs**
- `llm-wiki.md` — immutable founding vision
- `SCHEMA.md` — live wiki schema, including an explicit "Known gaps" section that prioritises future work
- `YOYO.md` — project context/commands

## Recent Changes (last 3 sessions, from journal)

1. **2026-04-07 01:50 — Bug squashing, schema doc, log format alignment.** Fixed a stale-state regex in the graph route, fixed empty-slug links in lint, made saved query answers emit cross-references, wrote `SCHEMA.md`, realigned `log.md` format to the founding spec, and added a structured renderer for `/wiki/log`. Janitorial session paying down drift against the vision.
2. **2026-04-06 19:15 — Lint contradictions, log browsing, URL fix.** LLM-powered contradiction detection across cross-referenced clusters, the `/wiki/log` UI, and a fix for URL ingestion choking on raw HTML.
3. **2026-04-06 15:24 — Polish, security, query→wiki loop.** NavHeader active-state fix, rewritten home page, path traversal guards on filesystem ops, and the marquee "save answer to wiki" flow that closes the sources → wiki → queries → wiki loop.

Git history note: the repo is a single squash commit (`533039c yoyo: growth session wrap-up`) — all narrative lives in `.yoyo/journal.md`.

## Source Architecture

```
src/lib/
  ingest.ts      439  slugify, URL fetch, ingest pipeline, cross-ref helpers
  lint.ts        388  orphan / stale / empty / crossref + LLM contradictions
  query.ts       348  index search + query + saveAnswerToWiki
  wiki.ts        230  fs I/O, index, log, validateSlug
  llm.ts          68  Vercel AI SDK wrapper (Anthropic + OpenAI)
  types.ts        42  shared interfaces
  __tests__/   2356  168 tests total (ingest 912, lint 555, query 424, wiki 394, llm 64, smoke 7)

src/app/
  page.tsx                   60  home
  layout.tsx                 24  root layout
  ingest/page.tsx           223  ingest form (text/url modes)
  query/page.tsx            233  query UI with save-to-wiki
  lint/page.tsx             165  lint results by severity
  wiki/page.tsx              61  wiki index listing
  wiki/[slug]/page.tsx       43  single page view (no edit/delete)
  wiki/graph/page.tsx       252  D3 force graph
  wiki/log/page.tsx          31  activity log
  api/ingest/route.ts        48
  api/query/route.ts         34
  api/query/save/route.ts    41
  api/lint/route.ts          18
  api/wiki/graph/route.ts    53

src/components/
  MarkdownRenderer.tsx  47  SPA-aware wiki link handling
  NavHeader.tsx         64  sticky nav (Browse / Graph / Ingest / Query / Lint)
```

Approx **2,308 lines** in `src/` (excluding tests), **2,356** in tests.

## Open Issues Summary

`gh issue list … --state open --limit 10` returned **`[]`** — no open issues. No community input competing with the founding-vision driven roadmap this session.

## Gaps & Opportunities

Prioritised against the founding vision (`llm-wiki.md`) and `SCHEMA.md`'s own Known Gaps list:

1. **Parallel write-paths still drift — extract a shared "write a wiki page" pipeline.** This is an explicit entry in `.yoyo/learnings.md` that has *not yet been applied*. `ingest()` (lines 383–439) and `saveAnswerToWiki()` (lines 295–348) both do: write page → update index (with existing-entry handling) → re-list → find related → update related → append log. The two code paths were spotted drifting once already — the fix was "duplicate the cross-ref step into saveAnswerToWiki". The durable fix (per the learning) is to extract `writeWikiPageWithSideEffects()` and have both callers go through it. Low risk, high payoff — collapses duplication and makes future ops (edit, delete, import) free.
2. **No edit / delete flow for wiki pages.** SCHEMA.md says "pages should not be edited by humans" but the vision explicitly mentions lint suggesting fixes; without any way to delete a stale page or re-ingest one, the wiki can only grow. "Delete/edit flow for wiki pages" has appeared in the "Next:" section of three consecutive journal entries and has never landed. MVP: a delete button on `/wiki/[slug]` that removes the `.md`, drops the index entry, optionally strips cross-references from linking pages, and appends a `delete` log entry.
3. **Lint does not log.** `SCHEMA.md#Known-gaps` says "Lint does not append a log entry, so lint passes are invisible in the timeline." This is a 5-line change (`appendToLog("lint", …)` in `lint()`) plus adding `"lint"` handling wherever log entries get rendered. Aligns the log with the founding-spec intent ("log gives a timeline of the wiki's evolution" — including lint passes).
4. **LLM provider list is narrower than advertised.** `YOYO.md` says "Multi-provider via Vercel AI SDK — supports Anthropic, OpenAI, Google, Ollama, etc." but `src/lib/llm.ts` only wires up Anthropic + OpenAI. Google (`@ai-sdk/google`) and Ollama (`ollama-ai-provider` / OpenAI-compatible base URL) would bring the code in line with the docs and the "bring your own key at deploy time" story.
5. **`/wiki/log` uses a flat MarkdownRenderer.** The 04-07 01:50 journal entry claims a "structured renderer for /wiki/log" was built, but the current page (31 lines) just pipes `log.md` through `MarkdownRenderer`. Either the structured renderer was reverted in the wrap-up squash or the journal entry was aspirational. A real timeline view (parse `## [date] op | title`, group by day, colour-code operations) would make the log a first-class browsing surface the way the founding vision describes.
6. **Activity Log is not in the nav header.** Users can only reach `/wiki/log` by first going to `/wiki` and clicking a button. The log is one of the two "special files" in the founding spec — it deserves first-class navigation alongside Browse/Graph.
7. **No YAML frontmatter on pages.** Listed in SCHEMA.md Known Gaps. Would unlock tags, dates, and source counts — prerequisite for richer lint checks (e.g. "page is stale: last updated N weeks ago").
8. **No vector search.** Listed in multiple past journal "Next:" sections and in SCHEMA.md Known Gaps. Still the eventual right move for large wikis, but less urgent than (1)–(6) — the index-first strategy already works at moderate scale per the founding vision.
9. **No raw-source browsing UI.** Users can't see the immutable layer from the app. SCHEMA.md Known Gaps.
10. **No human-in-the-loop diff review on ingest.** Writes happen silently. SCHEMA.md Known Gaps.

## Bugs / Friction Found

- **Learning not applied.** `.yoyo/learnings.md` explicitly warns against parallel write-paths drifting (ingest vs saveAnswerToWiki) — both still manually run the same 5-step sequence. This is the single highest-leverage refactor in the repo: it's called out in a learning, the risk has already been realised once, and fixing it makes several of the gaps above almost-free (edit, delete, re-ingest all become `writeWikiPageWithSideEffects` callers).
- **Schema vs code drift on "Related" section.** `SCHEMA.md` says "the updater appends a `## Related` section (or extends an existing one)" but `updateRelatedPages()` in `ingest.ts` (lines 319–356) actually writes a `**See also:** …` bold line, not a `## Related` heading. One of the two is wrong. The code has tests, so the schema is probably the drifting doc — but this is exactly the kind of thing SCHEMA.md's co-evolution policy is meant to catch.
- **Journal claims a "structured renderer for /wiki/log"** that does not exist in `src/app/wiki/log/page.tsx` (it's a 31-line file that just renders the raw markdown). Either a commit was lost in the squash wrap-up, or the journal entry overstated what landed.
- **Activity Log discoverability.** Not in `NavHeader` — surfaced only as a small button on `/wiki`. Friction for users trying to see "what happened recently".
- **`LintIssue.slug = ""` is used for wiki-level issues** (e.g. the "contradiction detection skipped — no LLM key" info message sets `slug: ""`). Harmless today but the previous bug-squash session specifically caught an empty-slug link being rendered — this is a pattern that wants a proper "wiki-level" vs "page-level" distinction on `LintIssue`, not a sentinel empty string.
- No bugs found in code review beyond the above; tests all pass; build is clean.
