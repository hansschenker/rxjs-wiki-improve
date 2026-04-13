# Assessment — 2026-04-13

## Build Status
✅ PASS — `pnpm build` succeeds (28 routes), `pnpm lint` clean, `pnpm test` passes 583 tests across 13 test files. Build emits expected ENOENT warnings for missing wiki/index.md and wiki/log.md (gitignored content dirs don't exist in CI — benign).

## Project State
The project is a fully functional Next.js 15 web app implementing all four founding vision pillars:

| Pillar | Status | Capabilities |
|--------|--------|-------------|
| **Ingest** | ✅ Complete | URL fetch (Readability + linkedom), text paste, batch multi-URL, content chunking, human-in-the-loop preview, raw source persistence, SSRF protection |
| **Query** | ✅ Complete | BM25 + optional vector search (RRF fusion), streaming responses, citation extraction, save-answer-to-wiki loop, query history |
| **Lint** | ✅ Complete | 6 checks (orphan, stale-index, empty, missing-crossref, contradiction, missing-concept-page) all with LLM-powered auto-fix |
| **Browse** | ✅ Complete | Wiki index with search/filter, page view with backlinks, edit/delete/create, interactive D3 graph with clustering, log viewer, raw source browser, global full-text search, Obsidian export |

Supporting infrastructure: multi-provider LLM (Anthropic, OpenAI, Google, Ollama via Vercel AI SDK v6), settings UI with config persistence, file locking, YAML frontmatter, error boundaries, mobile-responsive nav.

**17 API routes, 13 pages, 9 components, 19 library modules, 13 test files.**

## Recent Changes (last 3 sessions)

1. **2026-04-13 06:09** — Graph clustering with label-propagation community detection, decomposed ingest.ts by extracting fetch.ts, performance pass (findBacklinks cache, query double-read elimination)
2. **2026-04-13 02:01** — HiDPI graph fix (Retina canvas scaling), cross-ref false positives fix (partial slug matching), embeddings data-integrity (atomic writes, model-mismatch detection, text truncation)
3. **2026-04-12 20:28** — Delete ENOENT crash fix, lifecycle TOCTOU race fix, accessibility attributes, lint page cache, GlobalSearch dedup

All three sessions were hardening/polish — no new features, just making existing code more reliable and performant.

## Source Architecture

### Codebase: ~20,055 lines total

| Layer | Lines | Files | Description |
|-------|------:|------:|-------------|
| `src/lib/` | 5,588 | 19 | Core logic (ingest, query, lint, embeddings, config, lifecycle, wiki, etc.) |
| `src/lib/__tests__/` | 8,531 | 13 | Test suite (583 tests) |
| `src/app/` (pages) | ~3,100 | 13 | Next.js pages including error/loading boundaries |
| `src/app/api/` | ~1,360 | 17 | API route handlers |
| `src/components/` | 1,472 | 9 | Shared React components |

### Largest library modules
- `wiki.ts` (658) — filesystem ops, index, log, search, backlinks, page cache
- `lint.ts` (571) — 6 lint checks including LLM contradiction detection
- `query.ts` (548) — BM25, vector search, RRF, LLM synthesis
- `embeddings.ts` (472) — provider-agnostic vector store
- `ingest.ts` (461) — LLM page generation, content chunking
- `lint-fix.ts` (452) — auto-fix handlers for all lint issue types
- `fetch.ts` (403) — URL fetching, HTML parsing, SSRF protection

### Largest page components
- `settings/page.tsx` (616) — 10+ useState hooks, 3 async handlers, monolithic
- `wiki/graph/page.tsx` (581) — physics engine + canvas rendering + interactions in one file
- `ingest/page.tsx` (516) — 3-stage state machine, partially decomposed via BatchIngestForm
- `query/page.tsx` (507) — streaming logic + history sidebar + save-to-wiki

## Open Issues Summary
**No open issues** — `gh issue list` returns empty. The project has no external feature requests or bug reports pending.

## Gaps & Opportunities

### Relative to llm-wiki.md founding vision
1. **No image/asset handling** — images in source HTML are dropped during ingest. The vision explicitly mentions downloading images locally and having the LLM reference them.
2. **No Marp/slide deck output** — the vision mentions generating presentations from wiki content.
3. **No Dataview-style dynamic queries** — frontmatter exists but there's no query UI over structured metadata.
4. **No CLI tool** — the vision mentions CLI tools for the LLM to shell out to; currently web-only.
5. **Anthropic users get no vector search** — the default/most-common provider has no embedding API, so they fall back to pure BM25.

### Relative to YOYO.md direction
1. **No auth/multi-user** — listed as an open question, not yet addressed.
2. **No Obsidian plugin** — only export-to-zip exists.

### Code quality / tech debt
1. **Monolithic page components** — settings (616L), graph (581L), ingest (516L), query (507L) are all large single-file components that mix business logic, state management, and presentation.
2. **Inconsistent error/success alert styling** — 3 different visual patterns used across pages; should be a shared `<Alert>` component.
3. **`err instanceof Error` repeated 20+ times** — needs a shared `getErrorMessage()` utility.
4. **17 identical back-link patterns** — `text-sm text-foreground/60 hover:text-foreground` copy-pasted everywhere.
5. **Root `error.tsx` doesn't use `<PageError>`** — inconsistent with the other 4 error boundaries.
6. **No `engines` field in package.json** — no minimum Node.js version specified.

### Performance/reliability
1. **Lifecycle TOCTOU race** (noted in status.md) — `listWikiPages()` reads index outside file lock.
2. **No structured logging** — errors logged via `console.error` with `[module]` prefixes but no log levels or structured output.
3. **No rate limiting on API routes** — a rapid-fire client could overwhelm the LLM provider.

## Bugs / Friction Found

1. **Build warnings (benign)** — ENOENT for wiki/index.md and wiki/log.md during static generation. Not a bug (gitignored dirs), but noisy. Could be silenced by creating empty files during build or switching those pages to dynamic rendering.
2. **Verbose test stderr** — tests produce many ENOENT warnings to stderr (expected behavior being tested), making test output noisy. Could suppress with a test logger that swallows expected warnings.
3. **No TODO/FIXME comments** — the codebase is clean of stale markers, which is good.
4. **eslint-disable in graph page** — one legitimate `react-hooks/exhaustive-deps` suppression for the physics simulation effect.
5. **Zero open issues** — no external signals to prioritize. Direction must come from the vision and code review findings.
