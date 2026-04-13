Title: Decompose ingest.ts — extract URL fetching into fetch.ts
Files: src/lib/fetch.ts, src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## Problem

`ingest.ts` is 850 lines mixing four responsibilities: URL fetching/SSRF protection, text chunking, summary extraction, and the ingest orchestration pipeline. The assessment flags this as an architectural gap. The URL fetching code (isUrl, stripHtml, extractTitle, extractWithReadability, validateUrlSafety, fetchUrlContent, ingestUrl) is a self-contained module with its own imports (Readability, linkedom) that doesn't depend on any LLM or wiki logic.

## Plan

Create `src/lib/fetch.ts` and move these functions into it:

1. `isUrl(input: string): boolean`
2. `stripHtml(html: string): string`
3. `extractTitle(html: string): string`
4. `extractWithReadability(html: string, url: string)` — returns `{ title, content }`
5. `validateUrlSafety(url: string): void` — SSRF protection
6. `fetchUrlContent(url: string)` — returns `{ title, content, rawHtml }`
7. `ingestUrl(url: string)` — convenience wrapper

These functions currently span approximately lines 1-300 of ingest.ts. They depend on:
- `@mozilla/readability` and `linkedom` (move these imports)
- Constants from `./constants` (MAX_RESPONSE_SIZE, MAX_CONTENT_LENGTH, FETCH_TIMEOUT_MS)

They do NOT depend on: `callLLM`, `wiki.ts`, `slugify`, frontmatter, or any other ingest logic.

### In `ingest.ts`:
- Remove the moved functions
- Add `import { isUrl, fetchUrlContent, ingestUrl, stripHtml, extractTitle } from "./fetch"`
- Keep re-exports: `export { isUrl, fetchUrlContent } from "./fetch"` so existing consumers (API routes, tests) don't break

### In test file:
- The test file `ingest.test.ts` has tests for these URL functions. These tests can stay in `ingest.test.ts` for now (they import from `./ingest` which re-exports), OR create `fetch.test.ts` and move them. **Prefer keeping in ingest.test.ts** to minimize changes — the re-exports make it transparent.

### Expected result:
- `ingest.ts` drops from ~850 to ~550 lines
- `fetch.ts` is ~300 lines, focused purely on URL fetching and SSRF
- All existing imports continue working via re-exports
- Zero behavior change

## Verification

- `pnpm build && pnpm lint && pnpm test` — all 573+ tests pass
- Verify `fetch.ts` has no imports from `./llm`, `./wiki`, `./slugify` (it shouldn't depend on wiki/LLM logic)
- Verify `ingest.ts` no longer imports `@mozilla/readability` or `linkedom`
