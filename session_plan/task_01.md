Title: Fix embeddings data-integrity bugs (atomic write, model mismatch, text truncation)
Files: src/lib/embeddings.ts, src/lib/__tests__/embeddings.test.ts
Issue: none

Three related bugs in embeddings.ts that can cause data corruption or incorrect search results:

## 1. Non-atomic `saveVectorStore` (data corruption risk)

`saveVectorStore` uses raw `fs.writeFile` — a crash mid-write corrupts the vector store JSON. `saveConfig` in config.ts already demonstrates the correct pattern: write to a `.tmp` file, then `fs.rename` (atomic on POSIX).

Fix: Change `saveVectorStore` to write-to-tmp-then-rename, matching the `saveConfig` pattern:
```ts
const tmp = vectorStorePath() + ".tmp";
await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf-8");
await fs.rename(tmp, vectorStorePath());
```

## 2. `searchByVector` doesn't filter by embedding model

If a user switches embedding providers (e.g., OpenAI → Google), stale embeddings from the old model are compared against new query embeddings via cosine similarity, producing meaningless scores. The `upsertEmbedding` function already handles this by resetting the store when models mismatch, but `searchByVector` doesn't check.

Fix: In `searchByVector`, after loading the store, check if `store.model` matches `getEmbeddingModelName()`. If they differ, return an empty array (the store is stale and will be rebuilt on next upsert).

## 3. `embedText` sends full content with no truncation

Embedding models have token limits (e.g., OpenAI text-embedding-3-small: 8191 tokens). Long wiki pages sent as-is may silently truncate or error. 

Fix: Add a `MAX_EMBED_CHARS` constant (e.g., 24000 chars ≈ ~6000 tokens, safely under most limits) and truncate in `embedText` before sending. Also add it to `embedTexts`. Document the truncation.

## Tests

Add/update tests in embeddings.test.ts:
- Test that `saveVectorStore` creates a valid JSON file (existing tests likely cover this, just verify)
- Test that `searchByVector` returns empty when store model doesn't match current model
- Test that `embedText` truncates long input (mock the embed function to capture what was sent)

Verify: `pnpm build && pnpm lint && pnpm test`
