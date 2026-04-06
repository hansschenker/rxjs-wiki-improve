Title: Multi-page ingest — cross-reference existing pages and update related pages
Files: src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## Problem

Currently ingest creates exactly ONE wiki page per source document. The founding vision says: "a single source might touch 10-15 wiki pages" and "updates relevant entity and concept pages across the wiki." This is the core differentiator of LLM Wiki vs. RAG — knowledge is integrated, not just indexed.

## Implementation

This task adds cross-referencing to existing pages during ingest. When a new source is ingested, the LLM identifies which existing wiki pages are related and updates them with references to the new content.

### 1. Add `findRelatedPages` function in `ingest.ts`

```typescript
export async function findRelatedPages(
  newSlug: string,
  newContent: string, 
  existingEntries: IndexEntry[]
): Promise<string[]>
```

- If no LLM key or no existing pages, return empty array
- Send the index entries + a summary of the new content to the LLM
- System prompt: "Given this new wiki page and the existing wiki index, return a JSON array of slugs for pages that are related and should cross-reference this new page. Return at most 5 slugs. Return only the JSON array, nothing else."
- Parse the JSON response, validate slugs exist in the index
- On any error (parse failure, LLM error), return empty array gracefully

### 2. Add `updateRelatedPages` function in `ingest.ts`

```typescript
export async function updateRelatedPages(
  newSlug: string,
  newTitle: string,
  relatedSlugs: string[]
): Promise<string[]>  // returns slugs that were actually updated
```

- For each related slug, read the wiki page
- Check if it already contains a link to the new slug (skip if so)
- Append a "See also" cross-reference at the end: `\n\n**See also:** [New Title](new-slug.md)\n`
- If the page already has a "See also" section (line starting with `**See also:**`), append to it instead of creating a new one
- Write the updated page back
- Return the list of slugs that were actually modified

### 3. Update the main `ingest()` function

After step 4 (update index), add:

```typescript
// 5. Cross-reference related pages
const entries = await listWikiPages(); // re-read after index update
const relatedSlugs = await findRelatedPages(slug, content, entries);
const updatedSlugs = await updateRelatedPages(slug, title, relatedSlugs);

// 6. Log (update existing log line)
await appendToLog(`Ingested "${title}" as ${slug}, updated ${updatedSlugs.length} related pages`);

return {
  rawPath,
  wikiPages: [slug, ...updatedSlugs],
  indexUpdated: true,
};
```

### 4. Update `IngestResult` type if needed

The `wikiPages` field already returns `string[]` — it should now include the newly created page AND any updated related pages. Check `src/lib/types.ts` — no change needed if `wikiPages` is already `string[]`.

### 5. Add tests in `src/lib/__tests__/ingest.test.ts`

Add a new describe block `"cross-referencing"`:

- `findRelatedPages` returns empty array when no LLM key (mock hasLLMKey → false)
- `findRelatedPages` returns empty array when no existing pages
- `updateRelatedPages` appends "See also" link to related pages
- `updateRelatedPages` skips pages that already link to the new page
- `updateRelatedPages` appends to existing "See also" section rather than creating duplicate
- Full `ingest()` returns multiple wikiPages when cross-refs are updated (mock LLM to return related slugs)

Since tests mock `hasLLMKey` to return false, the cross-referencing won't fire in existing tests. Add specific tests that mock `hasLLMKey` → true and `callLLM` → return JSON array.

### Verification

```bash
pnpm build && pnpm lint && pnpm test
```

All 69 existing tests must continue to pass. New cross-ref tests must pass.
