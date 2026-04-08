Title: Add "delete" variant to LogOperation
Files: src/lib/wiki.ts, src/lib/__tests__/wiki.test.ts
Issue: none

## Context

The assessment (and `.yoyo/learnings.md`) flags this specific bug:

> The delete log uses `"other"` as its op kind — the learnings file explicitly
> flags this as the signal that `LogOperation` needs a real `"delete"` variant.
> Quick, mechanical fix.

Current state in `src/lib/wiki.ts`:
- `LogOperation` is `"ingest" | "query" | "lint" | "save" | "other"` (line 170)
- `ALLOWED_LOG_OPERATIONS` mirrors this list (lines 172–178)
- `deleteWikiPage()` calls `appendToLog("other", ...)` with a comment:
  `// We don't have a "delete" enum value (out of scope for this MVP) so use "other"...`
  (around lines 471–477)
- The JSDoc on `deleteWikiPage` step 6 says: `6. Append an "other" log entry recording the deletion.`

## Task

This is a small mechanical cleanup. Keep it tight.

1. **Add `"delete"` to `LogOperation`** in `src/lib/wiki.ts`:
   - Update the type union: `"ingest" | "query" | "lint" | "save" | "delete" | "other"`
   - Add `"delete"` to `ALLOWED_LOG_OPERATIONS` (insert before `"other"` so the natural-op kinds come first)

2. **Update `deleteWikiPage` in `src/lib/wiki.ts`** to use it:
   - Change `appendToLog("other", ...)` to `appendToLog("delete", ...)`
   - Remove the `// We don't have a "delete" enum value...` comment (it's no longer true)
   - Update the JSDoc step 6 to say: `6. Append a "delete" log entry recording the deletion.`

3. **Tests — `src/lib/__tests__/wiki.test.ts`**:
   - Find the existing `deleteWikiPage` test that asserts on the log. It should currently be checking for `"] other |"`. Update that expectation to `"] delete |"`.
   - Find any `appendToLog` test that iterates `ALLOWED_LOG_OPERATIONS` or enumerates the allowed values. Make sure `"delete"` is covered (it should flow automatically if tests iterate the exported list).
   - Find any `appendToLog` test that passes `"other"` as the operation — leave those intact (`"other"` is still a valid variant).
   - If there's no direct test for `appendToLog("delete", ...)`, add one small test: call it with a title, read the log back, assert the heading contains `" delete | "`.

4. **Do not touch** `/wiki/log` UI — it renders the log file verbatim as markdown, so no template changes needed.

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All 186 existing tests should pass (plus any new ones you add). The delete
log test should now show the cleaner `"] delete |"` heading.

## Commit message

```
yoyo: add "delete" variant to LogOperation

deleteWikiPage was logging as "other" with a TODO comment. Promote it
to a first-class log operation so activity-log readers can filter on
deletions the same way they filter on ingest/query/save/lint.
```

## Out of scope

- Any UI filter / coloring in /wiki/log based on op kind.
- Refactoring deleteWikiPage to go through writeWikiPageWithSideEffects (tracked separately).
- Adding an "edit" log op (task_02 handles that).
