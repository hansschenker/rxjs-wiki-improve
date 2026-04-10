Title: Extend lint auto-fix to support orphan-page, stale-index, and empty-page issues
Files: src/app/api/lint/fix/route.ts, src/app/lint/page.tsx
Issue: none

## Description

Currently only `missing-crossref` issues support auto-fix. Extend the fix route and lint UI to support three more issue types, covering all deterministic (non-LLM) lint issues.

### 1. `orphan-page` — Add page to index

An orphan page exists on disk but not in `index.md`. Fix: add it to the index via the existing lifecycle pipeline.

In `src/app/api/lint/fix/route.ts`, add a handler for `type === "orphan-page"`:
- Read the page with `readWikiPage(slug)`
- Extract a summary from the first paragraph (same approach as the existing fix)
- Call `writeWikiPageWithSideEffects` with the existing content (this will add/update the index entry)
- Return success message: "Added {slug} to index"

### 2. `stale-index` — Remove stale entry from index

A stale index entry references a page that doesn't exist on disk. Fix: remove the entry from `index.md`.

In the fix route, add a handler for `type === "stale-index"`:
- Import `listWikiPages` and `updateIndex` from `@/lib/wiki`
- Read current index entries with `listWikiPages()`
- Filter out the entry matching the stale slug
- Write the filtered entries back with `updateIndex(filteredEntries)`
- Append a log entry with `appendToLog` for the removal
- Return success message: "Removed stale entry for {slug} from index"

### 3. `empty-page` — Delete empty page

An empty page has <50 chars of content. Fix: delete it entirely.

In the fix route, add a handler for `type === "empty-page"`:
- Import `deleteWikiPage` from `@/lib/lifecycle`
- Call `deleteWikiPage(slug)` which handles index cleanup, cross-ref removal, embedding removal, and logging
- Return success message: "Deleted empty page {slug}"

### 4. Update lint UI to show Fix buttons for new types

In `src/app/lint/page.tsx`:
- The existing code only shows the "Fix" button when `issue.type === "missing-crossref"`. Update the condition to also show Fix buttons for `orphan-page`, `stale-index`, and `empty-page`.
- For `orphan-page` and `stale-index` and `empty-page`, the fix request body only needs `{ type, slug }` (no `targetSlug` needed).
- Update the `handleFix` callback to handle these simpler fix types — when type is not `missing-crossref`, send `{ type: issue.type, slug: issue.slug }` without requiring `targetSlug`.
- Use appropriate button labels: "Add to index" for orphan, "Remove from index" for stale, "Delete page" for empty.

### Important
- The `parseTargetSlug` helper is only for `missing-crossref` — don't require it for the new types.
- The fix key for dedup in `fixingSet` can be `${issue.type}:${issue.slug}` for the new types.
- Keep the `empty-page` delete button styled distinctively (red?) since it's destructive.

## Verification
```
pnpm build && pnpm lint && pnpm test
```
