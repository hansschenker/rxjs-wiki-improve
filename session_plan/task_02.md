Title: Show all touched pages (new + updated related) in ingest result UI
Files: src/app/ingest/page.tsx, src/lib/types.ts, src/lib/ingest.ts, src/app/api/ingest/route.ts

Issue: none

## Why this task

Gap #4 from the assessment: there is no human-in-the-loop review of what an ingest actually did. The founding vision explicitly describes the user "browsing the results in real time — following links, checking the graph view, reading the updated pages" while the LLM edits — but today the ingest success screen shows a single "View 'slug' →" button for the primary page and silently drops the list of related pages that cross-ref updates touched. That information already exists in `ingest()`'s return value (`wikiPages: [slug, ...updatedSlugs]`) but the UI throws all but the first element away.

This task is the **smallest useful trust-building step**: surface what's already being returned. No diff view, no approval gate, no rollback — just show the user "this ingest created 1 page and updated 3 related pages, here they all are." That alone is a major legibility win and is a natural seed for a future diff view.

## What to change

### 1. `src/lib/types.ts` — widen `IngestResult`

Currently:
```ts
export interface IngestResult {
  rawPath: string;
  wikiPages: string[];
  indexUpdated: boolean;
}
```

Change to distinguish the new page from updated ones:
```ts
export interface IngestResult {
  rawPath: string;
  /** Slug of the newly created/updated primary page. */
  primarySlug: string;
  /** Slugs of pre-existing pages that had cross-refs updated. Empty if none. */
  relatedUpdated: string[];
  /**
   * Flat list of every page this ingest touched: `[primarySlug, ...relatedUpdated]`.
   * Kept for backwards compatibility with the existing API consumers.
   */
  wikiPages: string[];
  indexUpdated: boolean;
}
```

### 2. `src/lib/ingest.ts` — populate the new fields

At the return statement in `ingest()`:
```ts
return {
  rawPath,
  primarySlug: slug,
  relatedUpdated: updatedSlugs,
  wikiPages: [slug, ...updatedSlugs],
  indexUpdated: true,
};
```

Nothing else in `ingest.ts` should change. `ingestUrl` delegates to `ingest` so it automatically inherits the new fields.

### 3. `src/app/api/ingest/route.ts`

The route currently just `return NextResponse.json(result)`. No code change needed — the new fields are forwarded automatically because they're part of the returned object. **Verify** the response JSON includes the new fields after your change, but do not add shape-munging code.

### 4. `src/app/ingest/page.tsx` — show all touched pages

Update the `IngestResponse` interface at the top of the file to match the new shape (add `primarySlug: string` and `relatedUpdated: string[]`).

Replace the success card's current single-link layout with a layout that shows:

- A header: `"✓ Ingested as wiki page"` (keep existing text)
- The primary page link (prominent, same styling as today — foreground-bg button):
  `View "{primarySlug}" →`
- If `relatedUpdated.length > 0`, a new section below:
  ```
  Also updated {N} related page(s):
  • [slug-1](/wiki/slug-1)
  • [slug-2](/wiki/slug-2)
  ...
  ```
  Use small text (`text-sm text-foreground/70`), a plain unordered list (no bullets needed — Tailwind `list-none` or flex-col with gap), and each item is a Next `Link` to `/wiki/{slug}`.
- If `relatedUpdated.length === 0`, render nothing for that section (not even a "no related pages updated" message — avoid clutter).
- Keep the existing "Back to wiki" and "Ingest another" footer actions unchanged.

Use `result.primarySlug` instead of `result.wikiPages[0]` for the primary link. Do NOT remove `wikiPages` from the response consumption — just don't rely on positional indexing.

## Tests

There's no UI test harness for `ingest/page.tsx`, so don't try to add one. For the library layer:

- In `src/lib/__tests__/ingest.test.ts` (if tests already assert against the return shape), update any existing assertions to check `primarySlug` and `relatedUpdated` in addition to `wikiPages`. If the existing tests only check `wikiPages`, leave them alone — backwards compatibility is the point of keeping that field.
- If there are no ingest-return-shape tests today, add one small test that asserts `result.primarySlug` is the slug of the ingested title and `result.relatedUpdated` is an array (empty for a first-ingest-ever scenario where no other pages exist to cross-ref).

## Non-goals

- No diff view. No before/after content comparison. Just surface the list.
- No approval gate. Ingest still writes immediately.
- No changes to `writeWikiPageWithSideEffects` or the lifecycle pipeline in `wiki.ts`.
- No new API routes.
- No changes to the query or lint flows — this is ingest-only.

## Verification

```
pnpm build && pnpm lint && pnpm test
```

Manually sanity-check by reading through the success card JSX and confirming that when `relatedUpdated.length === 0` the "Also updated" block is not rendered (no empty `<ul>`, no "0 related pages" string).
