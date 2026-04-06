Title: "Save answer to wiki" — file query answers back as wiki pages
Files: src/app/query/page.tsx, src/app/api/query/save/route.ts, src/lib/query.ts, src/lib/__tests__/query.test.ts
Issue: none

## Description

The founding vision (llm-wiki.md) explicitly says: "good answers can be filed back into the wiki as new pages." Currently the query UI shows answers but offers no way to save them. This closes the query→wiki feedback loop.

### Implementation Plan

1. **New API route `src/app/api/query/save/route.ts`**:
   - POST endpoint that accepts `{ title: string, content: string }` (the answer markdown)
   - Calls `ingest(title, content)` from `src/lib/ingest.ts` to save as a wiki page
   - The answer content is already markdown with citations — it becomes the wiki page body
   - Returns `{ slug: string, success: boolean }`
   - Validate title is non-empty, content is non-empty

2. **Update `src/app/query/page.tsx`**:
   - After a successful query result, show a "Save to Wiki" button below the answer
   - Clicking it opens a small inline form: a text input for the page title (pre-filled with the question)
   - On submit, POST to `/api/query/save` with the title and the answer markdown
   - Show success state with a link to the new wiki page (`/wiki/[slug]`)
   - Show error state if save fails
   - The save button should be disabled while saving (loading state)

3. **Add tests in `src/lib/__tests__/query.test.ts`**:
   - Test that the save endpoint creates a wiki page (this is really testing the ingest function which is already tested, so just add a light integration-style test)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```
