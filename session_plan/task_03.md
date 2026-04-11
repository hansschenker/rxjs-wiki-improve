Title: Add vector store rebuild API and UI trigger
Files: src/lib/embeddings.ts, src/app/api/settings/rebuild-embeddings/route.ts (new), src/app/settings/page.tsx
Issue: none

Gap #2 from the assessment: "No batch vector index rebuild — embeddings are generated incrementally on write but there's no way to rebuild the full store if you switch providers or the store gets corrupted."

## Changes

### 1. Library function: `rebuildVectorStore` in `src/lib/embeddings.ts`
Add an exported async function `rebuildVectorStore()` that:
- Lists all wiki pages via `listWikiPages()` + `readWikiPage()`.
- Creates a fresh `VectorStore` with the current embedding model name.
- Embeds each page's content (using `embedTexts` for batch efficiency if possible, otherwise sequential `embedText` calls).
- Saves the new store, completely replacing the old one.
- Returns a summary: `{ total: number, embedded: number, skipped: number, model: string }`.
  - `skipped` = pages where embedding failed (e.g., empty content).
- If no embedding provider is configured, throw a descriptive error ("No embedding provider configured. Set up OpenAI, Google, or Ollama in Settings.").
- Include a progress callback parameter: `onProgress?: (done: number, total: number) => void` for future streaming progress (the API route can ignore it for now).

### 2. API route: `src/app/api/settings/rebuild-embeddings/route.ts`
- POST handler that calls `rebuildVectorStore()` and returns the summary as JSON.
- On error (no provider, embedding failures), return 400/500 with a descriptive message.
- No auth needed (single-user local-first app).

### 3. Settings UI addition: `src/app/settings/page.tsx`
- In the Embeddings section of Settings, add a "Rebuild Vector Index" button.
- On click, POST to `/api/settings/rebuild-embeddings`.
- Show a loading spinner during rebuild.
- On success, display the summary (e.g., "Rebuilt: 42 pages embedded using text-embedding-3-small").
- On error, display the error message.
- Disable the button if no embedding provider is configured (check `hasEmbeddingSupport()` state or just let the API error handle it).

### Constraints
- The rebuild function must be safe to run concurrently with normal operations (it replaces the store atomically — write to a temp file then rename, or just overwrite since reads are point-in-time).
- Don't modify existing embedding functions — `rebuildVectorStore` composes them.
- Keep the Settings page change minimal — just add a button+status in the existing embeddings section, don't reorganize the whole page.

### Verification
```sh
pnpm build && pnpm lint && pnpm test
```
Add a unit test in `src/lib/__tests__/embeddings.test.ts` for the new `rebuildVectorStore` function — mock `listWikiPages`, `readWikiPage`, and `embedText` to verify it produces the correct store structure and summary.
