Title: Lint auto-fix for missing cross-references + SCHEMA.md cleanup
Files: src/app/api/lint/fix/route.ts (new), src/app/lint/page.tsx (modify), SCHEMA.md (modify)
Issue: none

## Description

Two improvements: add a "Fix" action for the most common lint issue type (missing cross-references), and clean up stale entries in SCHEMA.md's known-gaps section.

### 1. `src/app/api/lint/fix/route.ts` — Fix endpoint

Create a `POST /api/lint/fix` route that accepts a lint issue and applies the fix:

```typescript
// Request body:
{
  type: "missing-crossref",
  slug: string,       // the page that's missing the link
  targetSlug: string  // the page it should link to
}
```

For `missing-crossref` fixes:
1. Read the page at `wiki/<slug>.md`
2. Read the target page to get its title
3. Append a cross-reference link to the source page. If the page already has a `## Related` section, append to it. Otherwise, add a `## Related` section at the end with the link.
4. Use `writeWikiPageWithSideEffects` from `lifecycle.ts` to persist the change (this handles index update, log append, embedding upsert).
5. Return `{ success: true, slug, message }`.

Only support `missing-crossref` for now. Return `{ error: "Auto-fix not supported for this issue type" }` (400) for other types. This is deliberately scoped small — future sessions can add auto-fix for orphans (add to index), empty pages (regenerate from raw source), etc.

### 2. `src/app/lint/page.tsx` — Add Fix buttons

Modify the lint results UI to show a "Fix" button next to `missing-crossref` issues:
- Parse the issue message to extract the target slug (the message format is: `Page "X.md" mentions "Y" but doesn't link to Z.md`)
- Add a small "Fix" button inline with the issue
- On click, POST to `/api/lint/fix` with the issue details
- On success, remove the issue from the displayed list and show a brief success toast/message
- On error, show the error inline

Keep the button styling subtle (small, ghost-style) so it doesn't dominate the issue list.

### 3. SCHEMA.md cleanup

Update the `## Known gaps` section:
- **Remove** "No human-in-the-loop diff review on ingest" — this was implemented in the 2026-04-10 05:54 session (preview/commit workflow).
- **Add** a note that lint auto-fix is partially implemented (missing-crossref only).
- Verify other gaps are still accurate.

### Verification
```
pnpm build && pnpm lint && pnpm test
```
