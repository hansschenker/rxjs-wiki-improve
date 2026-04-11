Title: Add file locking to vector store writes
Files: src/lib/embeddings.ts, src/lib/__tests__/embeddings.test.ts
Issue: none

## Description

The vector store (`.vectors.json`) has no file lock for concurrent writes, unlike
`index.md` and `log.md` which both use `withFileLock()`. Two concurrent ingests can
race on `loadVectorStore()` → mutate → `saveVectorStore()` and one write silently
clobbers the other. This was flagged as a medium-severity bug in the assessment.

## Implementation

1. In `src/lib/embeddings.ts`:
   - Import `withFileLock` from `./lock`
   - Wrap the body of `upsertEmbedding()` in `withFileLock("vectors", async () => { ... })`
   - Wrap the body of `removeEmbedding()` in `withFileLock("vectors", async () => { ... })`
   - Wrap the `saveVectorStore(store)` call at the end of `rebuildVectorStore()` in
     `withFileLock("vectors", async () => { ... })` — the rebuild itself doesn't need
     locking (it builds a fresh store) but the final save should be atomic

2. In `src/lib/__tests__/embeddings.test.ts`:
   - Add a test that verifies concurrent `upsertEmbedding` calls don't clobber each other:
     call `upsertEmbedding` twice concurrently with different slugs, then verify both
     entries exist in the stored result. Mock `embedText` to return a fixed vector.

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```
