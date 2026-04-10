# Assessment — 2026-04-10

## Build Status
**All green.** `pnpm build` succeeds (19 static pages generated), `pnpm lint` clean, `pnpm test` passes 338 tests across 8 test files (2.4s).

## Project State
The app is a fully functional local-first LLM wiki with all four core operations from the founding vision implemented end-to-end:

- **Ingest** — URL or text input → LLM summarization → wiki page creation with cross-references, frontmatter, and index updates. Two-phase preview/commit workflow for human review. Content chunking for long documents (12K chars/chunk). HTML extraction via Mozilla Readability.
- **Query** — Hybrid BM25 + optional vector search with RRF fusion. Streaming responses. Save-answer-to-wiki closes the knowledge compounding loop.
- **Lint** — Structural checks (orphans, stubs, missing cross-refs, stale index entries) + LLM-powered contradiction detection via BFS-clustered page groups. Results logged.
- **Browse** — Wiki index with search/tag filters/metadata pills, individual page view with markdown rendering, edit flow, delete flow, graph view (D3 force simulation), activity log, raw source browsing, Obsidian export (zip with wikilinks).

Supporting infrastructure:
- Multi-provider LLM (Anthropic/OpenAI/Google/Ollama via Vercel AI SDK)
- Provider-agnostic embeddings (OpenAI/Google/Ollama — Anthropic has no embedding API)
- Unified write/delete lifecycle pipeline (`lifecycle.ts`)
- YAML frontmatter with custom parser (no full YAML dep)
- Schema-driven prompts (SCHEMA.md loaded at runtime)
- Path traversal protection, slug validation, content-hash dedup
- StatusBadge showing provider config on home page
- Mobile-responsive nav with hamburger menu

## Recent Changes (last 3 sessions)

1. **2026-04-10 05:54** — Ingest preview mode (two-phase generate → review → commit), dark theme fix, `/api/status` endpoint + home page status indicator.
2. **2026-04-10 01:53** — Dedup summary extraction, configurable `maxOutputTokens`, extract `lifecycle.ts` module, content chunking for long documents.
3. **2026-04-09 20:42** — Embedding infrastructure (JSON vector store, provider-agnostic), hybrid BM25+vector query via RRF, Obsidian export.

## Source Architecture

```
src/lib/           (~2,941 lines, 12 files)
  ingest.ts          636   — ingestion pipeline
  query.ts           541   — query + hybrid search
  wiki.ts            426   — file I/O, index, log, cross-refs
  lint.ts            408   — health checks + contradiction detection
  lifecycle.ts       326   — unified write/delete pipeline
  embeddings.ts      308   — vector store + embedding
  frontmatter.ts     267   — YAML parser/serializer
  llm.ts             220   — multi-provider LLM abstraction
  raw.ts             125   — raw source storage
  types.ts            62   — shared interfaces
  export.ts           27   — Obsidian link converter
  citations.ts        21   — citation slug extractor

src/app/           (~1,578 lines, 10 page files)
  page.tsx            62   — landing page
  layout.tsx          24   — root layout
  ingest/page.tsx    469   — ingest UI (preview workflow)
  query/page.tsx     302   — query UI (streaming)
  lint/page.tsx      165   — lint UI
  wiki/page.tsx       23   — wiki index (delegates to WikiIndexClient)
  wiki/[slug]/        162  — page view + edit
  wiki/graph/        252   — D3 graph view
  wiki/log/           31   — activity log
  raw/               174   — raw source browse

src/components/    (~673 lines, 6 files)
  NavHeader.tsx      135   — navigation
  WikiIndexClient    235   — index with search/filter
  WikiEditor          96   — markdown editor
  StatusBadge         93   — provider status
  MarkdownRenderer    59   — markdown display
  DeletePageButton    55   — delete with confirm

src/app/api/       (~522 lines, 10 route files)
  ingest, query, query/stream, query/save, lint,
  wiki/[slug], wiki/graph, wiki/export, raw/[slug], status

src/lib/__tests__  (~4,929 lines, 8 test files)
  338 tests covering wiki, ingest, query, lint, llm, embeddings, export

SCHEMA.md          185   — wiki conventions (loaded at runtime into prompts)
```

**Total source:** ~10,828 lines (lib + app + components + API + tests + schema)

## Open Issues Summary
No open GitHub issues. The project is currently driven by the founding vision and yoyo's gap analysis.

## Gaps & Opportunities

### Relative to llm-wiki.md founding vision:

1. **No settings/config UI** — Users must edit `.env` files to configure LLM providers. The journal has flagged "settings UI so users can configure providers without editing env vars" as a next step for multiple sessions. This is a significant UX barrier for the target audience ("anyone").

2. **No batch ingest** — The vision mentions "batch-ingest many sources at once". Current UI only handles one source at a time. No queue, no progress tracking for multiple sources.

3. **No auto-fix for lint issues** — Lint detects problems but doesn't offer to fix them. The vision implies the LLM should be able to resolve issues (create missing pages, add cross-references, resolve contradictions). Journal has noted this as a candidate for several sessions.

4. **No image/asset handling** — Images in source HTML are dropped during URL ingest. The vision and tips section discuss image handling extensively.

5. **No vector index rebuild** — Embeddings are generated incrementally on write, but there's no way to rebuild the entire vector store (e.g., after switching embedding providers or recovering from corruption). SCHEMA.md known-gap.

6. **No concurrency safety** — Simultaneous ingests could corrupt `index.md` or `log.md`. SCHEMA.md known-gap.

7. **SCHEMA.md known-gaps stale** — "No human-in-the-loop diff review on ingest" is listed as a gap but was actually implemented in the most recent session (preview mode). The schema needs updating.

### Relative to YOYO.md aspirations:

8. **No auth or multi-user support** — Listed as an open question. Currently single-user local-only.

9. **No deployment story** — No Docker, no Vercel config, no one-click deploy. "Local-first" is working but there's no path to hosted.

### Quality/polish gaps:

10. **Ingest page is 469 lines** — The largest UI component. Likely candidates for extraction: preview diff view, URL input form, text input form, result display.

11. **No error boundaries** — Client components use local error state but there are no React error boundaries for graceful failure.

12. **No loading states on graph page** — The D3 graph fetches data client-side but behavior during loading/error isn't polished.

## Bugs / Friction Found

1. **SCHEMA.md known-gaps out of date** — Lists "No human-in-the-loop diff review on ingest" as a gap, but the preview/commit workflow was added in the 2026-04-10 05:54 session. Should be removed or marked as resolved.

2. **No `pnpm install` in CI checkout** — Build and test both failed initially because `node_modules` was missing. The grow workflow likely handles this, but it's worth verifying.

3. **Single commit on current branch** — `git log` shows only 1 commit (`242c306 yoyo: growth session wrap-up`), suggesting the branch was squashed or this is a fresh checkout. History context is limited to the journal.

4. **Test coverage is library-only** — 338 tests across 8 files, but all are in `src/lib/__tests__/`. No component tests, no API route tests, no integration tests. The library layer is well-tested; the HTTP and UI layers are not.

5. **`extractSummary` in ingest.ts (line 229-230)** — The non-LLM fallback creates a preview by slicing content at 200 chars. This is only used when no LLM key is set, but the resulting "summary" is nearly useless for index entries.
