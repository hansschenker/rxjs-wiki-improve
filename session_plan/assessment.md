# Assessment — 2026-04-11

## Build Status

✅ **Pass** — `pnpm build` succeeds (all routes compile), `pnpm test` passes 449 tests across 10 test files (2.96s).

## Project State

The app is a fully functional LLM Wiki with all four founding-vision pillars implemented:

**Core operations:**
- **Ingest** — URL fetch (Readability + linkedom), text paste, batch multi-URL mode, human-in-the-loop preview, content chunking for long docs, cross-reference discovery, raw source archival
- **Query** — BM25 full-body search + optional vector search (RRF fusion), streaming responses, save-answer-to-wiki loop, LLM-powered answer synthesis with citations
- **Lint** — 5 checks (orphan-page, stale-index, empty-page, missing-crossref, contradiction), all with auto-fix paths including LLM-powered contradiction resolution
- **Browse** — wiki index with search/tag filters, individual page view with backlinks, graph view (D3 force simulation), raw source browsing, activity log, global search bar

**Infrastructure:**
- Multi-provider LLM via Vercel AI SDK (Anthropic, OpenAI, Google, Ollama)
- Settings UI for provider/model/API key config (persisted to JSON)
- Embedding layer with vector store (OpenAI, Google, Ollama — not Anthropic)
- YAML frontmatter on wiki pages (title, slug, sources, timestamps, tags)
- File locking for concurrent write protection (in-process only)
- Obsidian export (zip with `[[wikilinks]]`)
- Error boundaries on all major routes
- Full CRUD on wiki pages (create, read, edit, delete)

**Scale:** ~16,500 lines of TypeScript across 68 source files — 4,466 lines of library code, 6,624 lines of tests, 2,873 lines of page components, 1,352 lines of shared components, 922 lines of API routes.

## Recent Changes (last 3 sessions)

1. **2026-04-11 16:29** — Streaming retry resilience (`callLLMStream` pre-stream retry wrapper), backlinks UI ("What links here" on wiki pages), SCHEMA.md update for contradiction auto-fix
2. **2026-04-11 12:40** — Contradiction auto-fix (LLM-powered resolution), file locking (`withFileLock`), exponential backoff in LLM retry path
3. **2026-04-11 08:35** — Error boundaries on sub-routes, centralized constants module (`constants.ts`), API error handling bug fixes

## Source Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # 12 API routes (922 lines)
│   │   ├── ingest/route.ts       #   single + batch
│   │   ├── lint/route.ts         #   lint + fix
│   │   ├── query/route.ts        #   query + stream + save
│   │   ├── raw/[slug]/route.ts
│   │   ├── settings/route.ts     #   config + rebuild-embeddings
│   │   ├── status/route.ts
│   │   └── wiki/route.ts         #   CRUD + export + graph
│   ├── ingest/page.tsx           #   513 lines (URL/text/batch modes)
│   ├── query/page.tsx            #   329 lines (streaming Q&A)
│   ├── lint/page.tsx             #   317 lines (issue list + auto-fix)
│   ├── settings/page.tsx         #   616 lines (provider config)
│   ├── wiki/                     #   browse + graph + log + new + edit
│   │   ├── [slug]/page.tsx       #   139 lines
│   │   ├── graph/page.tsx        #   442 lines (D3 force graph)
│   │   └── ...
│   ├── raw/                      #   source browsing
│   └── page.tsx                  #   95 lines (home/dashboard)
├── components/                   # 8 shared components (1,352 lines)
│   ├── NavHeader.tsx             #   215 lines (responsive nav + global search)
│   ├── GlobalSearch.tsx          #   271 lines (title-based search)
│   ├── WikiIndexClient.tsx       #   249 lines (filterable page list)
│   ├── BatchIngestForm.tsx       #   316 lines
│   └── ...
└── lib/                          # Core logic (4,466 lines) + tests (6,624 lines)
    ├── ingest.ts                 #   627 lines (fetch, clean, LLM, chunk)
    ├── query.ts                  #   536 lines (BM25, vector, RRF, LLM)
    ├── wiki.ts                   #   461 lines (filesystem, index, log, cross-refs)
    ├── embeddings.ts             #   440 lines (vector store, embed, search)
    ├── lint.ts                   #   408 lines (5 checks)
    ├── config.ts                 #   353 lines (settings persistence)
    ├── lifecycle.ts              #   327 lines (write/delete pipeline)
    ├── llm.ts                    #   314 lines (multi-provider, retry, stream)
    ├── lint-fix.ts               #   307 lines (auto-fix for all 5 checks)
    ├── frontmatter.ts            #   267 lines (YAML parse/serialize)
    └── ...                       #   (raw, lock, types, constants, etc.)
```

## Open Issues Summary

No open issues on `yologdev/karpathy-llm-wiki`.

## Gaps & Opportunities

### vs. Founding Vision (llm-wiki.md)

| Vision Feature | Status | Gap |
|---|---|---|
| Raw sources (immutable) | ✅ Done | — |
| Wiki (LLM-generated markdown) | ✅ Done | — |
| Schema (conventions doc) | ✅ Done | — |
| Ingest (one-at-a-time) | ✅ Done | — |
| Ingest (batch) | ✅ Done | No preview mode for batch |
| Query (cited answers) | ✅ Done | — |
| Query (answers → wiki pages) | ✅ Done | — |
| Lint (health check) | ✅ Done | — |
| index.md (content catalog) | ✅ Done | — |
| log.md (chronological) | ✅ Done | — |
| Image/asset handling | ❌ Missing | Images dropped on URL ingest; no asset store |
| Obsidian integration | ⚠️ Partial | Export-only; no live Obsidian vault sync |
| CLI tools / search engine | ⚠️ Partial | BM25+vector in-process; no CLI interface |
| Marp slide generation | ❌ Missing | Mentioned in vision, not implemented |
| Dataview-style queries | ❌ Missing | Frontmatter exists but no dynamic table views |

### vs. YOYO.md Direction

| Direction | Status | Gap |
|---|---|---|
| Ingest (URL/text) | ✅ Done | — |
| Query (cited answers) | ✅ Done | — |
| Lint (health check) | ✅ Done | — |
| Browse (index, cross-refs, graph) | ✅ Done | Graph lacks zoom/pan; no clustering |
| Multi-provider LLM | ✅ Done | — |
| Local-first | ✅ Done | — |
| Auth/multi-user | ❌ Not started | No auth layer at all |

### Biggest Opportunities (by impact)

1. **Performance at scale** — `listWikiPages()` reads every file from disk on every operation; `buildCorpusStats()` reads all pages on every query. At 100+ pages these become real bottlenecks. Could denormalize metadata into index.md or add a lightweight cache.
2. **Global search quality** — `GlobalSearch` only matches page titles, not content. Should leverage the existing BM25/vector infrastructure for content-level search results.
3. **Home dashboard** — for non-empty wikis, the home page is sparse. Could show recent activity, wiki growth stats, or a mini-graph.
4. **Component decomposition** — settings (616 lines), ingest (513 lines), and graph (442 lines) pages are monolithic and would benefit from extraction into focused subcomponents.
5. **Vector store concurrency** — `.vectors.json` has no file lock for concurrent writes, unlike index.md and log.md which do.
6. **Content-type awareness on URL fetch** — fetching PDFs, images, or non-HTML URLs silently produces garbage. Should check `Content-Type` and reject or handle appropriately.
7. **"Test Connection" for settings** — the status check only verifies key presence, not that the credentials actually work.

## Bugs / Friction Found

| Severity | Location | Issue |
|---|---|---|
| Medium | `embeddings.ts` `upsertEmbedding()` | **No file lock** on vector store writes. Concurrent ingests can clobber `.vectors.json`. All other shared files use `withFileLock()`. |
| Medium | `config.ts` | **Heavy duplication** — `getEffectiveProvider()`, `getEffectiveSettings()`, and `getResolvedCredentials()` contain near-identical env→config→default resolution cascades (~190 lines of similar logic). |
| Medium | `embeddings.ts` | **Duplicated provider detection** — `getEmbeddingModelName()` and `getEmbeddingModel()` duplicate the same OpenAI→Google→Ollama→config cascade. |
| Low | `ingest.ts` `fetchUrlContent()` | No `Content-Type` check — fetching a PDF or image attempts HTML parsing silently. |
| Low | `lint-fix.ts` `fixContradiction()` | LLM output used directly as page content with no validation. Empty/malformed response overwrites the page. |
| Low | `lint.ts` | O(n²) disk reads — `checkMissingCrossRefs()` reads all pages in an inner loop; could share a single read pass with other checks. |
| Low | `GlobalSearch.tsx` | Uses `/api/wiki/graph` (builds full link graph) just to get page names for title search. Heavier than necessary. |
| Info | General | No auth on any endpoint — fine for local-first personal use but worth noting for any future deployment story. |
