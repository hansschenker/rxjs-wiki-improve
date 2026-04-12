Title: Fix confirmed bugs — delete ENOENT, lifecycle TOCTOU, accessibility gaps
Files: src/lib/lifecycle.ts, src/app/query/page.tsx, src/app/ingest/page.tsx
Issue: none

## Problem

Three categories of confirmed issues that are each small enough to fix together:

### Bug 1: Unhandled ENOENT on concurrent delete (lifecycle.ts)

Line 177: `await fs.unlink(filePath)` has no try/catch. If two concurrent deletes target the same slug, the second one will throw an unhandled ENOENT. The `deleteWikiPage` function already checks for page existence before calling `runPageLifecycleOp`, but that check is non-atomic with the unlink.

**Fix:** Wrap the `fs.unlink` call in a try/catch that swallows ENOENT (file already gone = success) but re-throws other errors.

```ts
try {
  await fs.unlink(filePath);
} catch (err: unknown) {
  // If the file is already gone (concurrent delete), that's fine — treat as success.
  if (!(err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT')) {
    throw err;
  }
}
```

### Bug 2: TOCTOU in lifecycle.ts cross-ref path (lifecycle.ts)

Line 228: After the index is updated inside `withFileLock`, the cross-ref path calls `listWikiPages()` OUTSIDE the lock to get refreshed entries. A concurrent ingest between the lock release and this read could produce stale data. 

**Fix:** Capture the post-mutation entries from inside the lock and use them for cross-ref. The `postIndexEntries` variable is already set inside the lock — use it instead of re-reading.

Change line 228 from:
```ts
const refreshedEntries = await listWikiPages();
```
to use `postIndexEntries!` which was already computed inside the lock.

### Bug 3: Accessibility gaps (query/page.tsx, ingest/page.tsx)

1. **Query textarea missing label** — Add `aria-label="Your question"` to the textarea at line 323
2. **Save-answer label not associated** — Add `id="save-title"` to the input and `htmlFor="save-title"` to the label at lines 392-401
3. **Ingest mode toggle missing aria** — Add `role="group"` and `aria-label="Input mode"` to the container div, and `aria-pressed={mode === "text"}` etc. to each toggle button at lines 385-418

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All changes are backward-compatible. Existing tests should pass. The lifecycle fixes are defensive (handling edge cases that don't occur in tests' single-threaded environment).
