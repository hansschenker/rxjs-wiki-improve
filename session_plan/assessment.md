# Assessment — 2026-04-09

## Build Status
**Pass.** `pnpm build` compiles cleanly (Next.js 15.5.14, no type errors, no lint errors). `pnpm test` passes 259 tests across 6 test files in ~2 seconds.

## Project State

The app implements all four pillars from the founding vision:

| Feature | Library | API Route | UI Page | Status |
|---------|---------|-----------|---------|--------|
| **Ingest** | `ingest.ts` (428 LOC) | `POST /api/ingest` | `/ingest` | Full — URL + text, Readability extraction, LLM wiki page gen, cross-ref, frontmatter, graceful no-LLM fallback |
| **Query** | `query.ts` (524 LOC) | `POST /api/query`, `POST /api/query/stream`, `POST /api/query/save` | `/query` | Full — BM25 scoring (full-body), streaming responses, citation extraction, save-answer-to-wiki |
| **Lint** | `lint.ts` (408 LOC) | `POST /api/lint` | `/lint` | Full — orphans, stale, empty, missing cross-refs, LLM contradiction detection |
| **Browse** | `wiki.ts` (711 LOC) | `GET/PUT/DELETE /api/wiki/[slug]`, `GET /api/wiki/graph` | `/wiki`, `/wiki/[slug]`, `/wiki/[slug]/edit`, `/wiki/graph`, `/wiki/log`, `/raw`, `/raw/[slug]` | Full — index with search/filter, page view/edit/delete, graph visualization, log viewer, raw source browsing |

**Supporting infrastructure:**
- Multi-provider LLM via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama) — `llm.ts` (134 LOC)
- Hand-rolled YAML frontmatter parser — `frontmatter.ts` (262 LOC)
- Raw source CRUD — `raw.ts` (125 LOC)
- Unified write pipeline — `writeWikiPageWithSideEffects` handles write+index+cross-ref+log
- NavHeader with active-link highlighting across all pages
- MarkdownRenderer with SPA navigation for wiki links
- D3-style force-directed graph view (custom canvas implementation)
- SCHEMA.md co-evolves with code; loaded into LLM prompts at runtime

**Total codebase:** ~8,925 lines across 30 source files (including ~3,900 lines of tests).

## Recent Changes (last 3 sessions)

1. **2026-04-09 13:07** — Fixed streaming/non-streaming context inconsistency, extracted `frontmatter.ts` and `raw.ts` from the 700-line `wiki.ts`, upgraded BM25 to score full page bodies, updated SCHEMA.md gaps.

2. **2026-04-09 09:00** — Added streaming query responses (token-by-token rendering), wired SCHEMA.md into lint and query system prompts so all three LLM ops load conventions at runtime.

3. **2026-04-09 05:52** — Ingest system prompt loads SCHEMA.md at runtime, ingest UI surfaces all touched pages (new + cross-ref-updated), query search upgraded from keyword prefilter to proper BM25 scoring.

**Pattern:** Recent sessions have focused on consistency and quality (streaming, BM25, runtime schema loading, module extraction) rather than new features. The foundational feature set is complete.

## Source Architecture

```
src/lib/           — Core logic (2,649 LOC)
  wiki.ts            711   Wiki CRUD, index, log, cross-refs, lifecycle pipeline
  query.ts           524   BM25 scoring, context building, LLM query, save-to-wiki
  ingest.ts          428   URL fetch, Readability, LLM page gen, frontmatter
  lint.ts            408   Structural checks + LLM contradiction detection
  frontmatter.ts     262   Hand-rolled YAML frontmatter parser/serializer
  llm.ts             134   Multi-provider abstraction via Vercel AI SDK
  raw.ts             125   Raw source storage CRUD
  types.ts            57   Shared TypeScript interfaces

src/lib/__tests__  — Test suite (3,903 LOC)
  wiki.test.ts      1287   Wiki operations
  ingest.test.ts    1051   Ingest pipeline
  query.test.ts      814   Query + BM25
  lint.test.ts       632   Lint checks
  llm.test.ts        112   LLM provider integration
  smoke.test.ts        7   Basic smoke test

src/app/           — Next.js pages + API routes (1,463 LOC)
  page.tsx            60   Home — 2×2 feature card grid
  query/page.tsx     321   Chat-style query with streaming
  ingest/page.tsx    246   Ingest form (URL + text)
  lint/page.tsx      165   Lint results display
  wiki/[slug]/page   118   Wiki page view
  wiki/graph/page    252   Force-directed graph view
  wiki/[slug]/edit    44   Edit page
  wiki/page.tsx       23   Wiki index (delegates to WikiIndexClient)
  wiki/log/page.tsx   31   Activity log viewer
  raw/page.tsx        88   Raw source index
  raw/[slug]/page     86   Raw source viewer
  api/ (6 routes)    361   REST endpoints for all operations

src/components/    — React components (481 LOC)
  WikiIndexClient    200   Index with search, tag filters, metadata pills
  WikiEditor          96   Edit form for wiki pages
  NavHeader           71   Sticky nav with active-link highlighting
  MarkdownRenderer    59   Markdown + SPA link interception
  DeletePageButton    55   Delete confirmation + API call

Config files: SCHEMA.md, tailwind.config.ts, vitest.config.ts, next.config.ts, eslint.config.mjs
```

## Open Issues Summary

No open issues on the GitHub repo (`gh issue list` returned `[]`).

## Gaps & Opportunities

### High-Value Gaps (vs. founding vision in llm-wiki.md)

1. **No vector search.** The founding vision calls for proper search as the wiki grows. Currently full-body BM25 reads every page from disk on every query — functional but O(N) and purely lexical. This is the most-repeated "next" item in the journal (mentioned in 8+ sessions). Opportunity: embed pages on write, persist embeddings, use cosine similarity for retrieval.

2. **No image/asset handling.** URL ingest drops all images from source HTML. The founding vision explicitly mentions local image downloading and LLM image viewing. Opportunity: download images referenced in HTML sources to a `raw/assets/` directory, preserve image links in wiki pages.

3. **No human-in-the-loop review on ingest.** The founding vision describes users reviewing LLM-generated updates ("I read the summaries, check the updates, and guide the LLM on what to emphasize"). Currently ingest writes immediately. Opportunity: show a diff/preview before committing changes, let users accept/reject/edit each touched page.

4. **No context window management.** No token counting or context budget. Long pages or large wikis could silently exceed provider limits. Opportunity: estimate token counts before LLM calls, truncate or paginate context, warn when approaching limits.

5. **No concurrency safety.** Simultaneous ingests could corrupt `index.md` or `log.md`. SCHEMA.md lists this as a known gap. Opportunity: file-level locking or queue-based serialization.

### Medium-Value Gaps

6. **No batch ingest.** The vision describes batch-ingesting many sources at once. Current UI accepts one source at a time.

7. **No Obsidian export/integration.** The founding vision is deeply Obsidian-oriented (graph view, Dataview, Web Clipper). No export to Obsidian vault format.

8. **No alternative output formats.** The vision mentions Marp slide decks, charts, comparison tables. Query only outputs markdown text.

9. **No query history.** Each page load starts fresh. Previous queries and answers are lost (unless explicitly saved to wiki).

10. **Mobile responsiveness.** NavHeader with 7 items overflows on small screens. No hamburger menu.

### Architectural Improvements

11. **Performance at scale.** Multiple code paths read all wiki pages per request (BM25, lint, listWikiPages enrichment). No caching. Will degrade noticeably past ~100 pages.

12. **Code duplication.** `buildCorpusStats` / `buildFullBodyCorpusStats` in query.ts are ~90% identical. `extractCitedSlugs` is duplicated client/server-side. Sequential page reads in lint, query, and wiki could be parallelized with `Promise.all`.

13. **Silent error swallowing.** Multiple `catch {}` blocks with no logging (llm.ts, lint.ts, wiki.ts) — good resilience but makes debugging invisible failures hard.

14. **Frontmatter round-trip bug.** The serializer writes `\"` for escaped quotes, but the parser doesn't unescape — values containing double quotes won't round-trip correctly.

15. **Raw layer mutability contradiction.** SCHEMA.md and wiki.ts comments say "raw sources are immutable" but `saveRawSource()` overwrites files on re-ingest.

## Bugs / Friction Found

1. **Frontmatter round-trip bug** — Serializer escapes `"` → `\"` in YAML values, but `parseFrontmatter`'s `unquoteScalar` strips outer quotes without unescaping `\"`. Values containing double quotes will corrupt on write→read cycle. Low severity (rare in practice; titles/tags seldom contain quotes).

2. **Incomplete HTML entity decoding** — `ingest.ts` only handles 6 named entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`, `&nbsp;`). Numeric entities (`&#8212;`, `&#x2014;`) and other named entities (`&mdash;`, `&hellip;`) pass through as raw text in wiki pages. Medium severity (visible in ingested content from real-world HTML).

3. **No retry/rate-limit handling in LLM calls** — A single transient 429 or 500 from the provider fails the entire ingest/query/lint. No backoff. Medium severity (affects real usage under load or with rate-limited API keys).

4. **`maxOutputTokens` hardcoded at 4096** — Too low for large ingest jobs (long articles), too high for short classification tasks (finding related pages). No per-call configurability. Low severity (works for typical content but truncates long articles).

5. **Graph view accessibility** — Canvas-only rendering provides nothing for screen readers. No ARIA attributes, no keyboard navigation, no hover feedback. Low severity (browse is accessible via index; graph is supplementary).

6. **Query sources display raw slugs** — Citation pills in the query UI show `machine-learning` instead of human-readable titles. Minor UX friction.
