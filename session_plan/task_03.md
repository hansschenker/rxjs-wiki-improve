Title: Content-Type validation on URL fetch
Files: src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## Description

`fetchUrlContent()` in `ingest.ts` doesn't check the response `Content-Type` header.
Fetching a PDF, image, or other binary URL silently attempts HTML parsing and produces
garbage wiki content. The assessment flagged this as a low-severity bug.

## Implementation

1. In `src/lib/ingest.ts`, in `fetchUrlContent()`, after the `response.ok` check and
   before reading the body:
   - Read `response.headers.get("content-type")` and extract the MIME type (before `;`)
   - Define an allowlist of acceptable types: `text/html`, `application/xhtml+xml`,
     `text/plain`, `text/markdown`, `application/xml`, `text/xml`
   - If the content type is present and doesn't match any allowed type, throw an error:
     `Unsupported content type: ${contentType}. Only HTML and text content can be ingested.`
   - For `text/plain` and `text/markdown`, skip the HTML parsing path — return the raw
     text directly with the URL hostname as the title

2. In `src/lib/__tests__/ingest.test.ts`:
   - Add tests for `fetchUrlContent`:
     - Mock `fetch` to return a response with `content-type: application/pdf` → expect
       the function to throw with "Unsupported content type"
     - Mock `fetch` to return a response with `content-type: image/png` → expect throw
     - Mock `fetch` to return a response with `content-type: text/plain` → expect success
       with raw text content (no HTML parsing)
     - Mock `fetch` to return a response with no Content-Type header → expect it to
       proceed with HTML parsing (backward compatible)

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```
