Title: Fix bugs in settings, query, and ingest pages
Files: src/app/settings/page.tsx, src/app/query/page.tsx, src/app/ingest/page.tsx
Issue: none

## Description

Fix four UI bugs identified in the assessment:

### 1. Settings: `embeddingModel` state never populated from API response
In `fetchSettings` (around line 123), the callback populates `provider`, `model`, and `ollamaBaseUrl` from the fetched `EffectiveSettings` data, but never sets `embeddingModel`. Add the missing setter:
```
if (data.embeddingModelSource === "config" && data.embeddingModel) {
  setEmbeddingModel(data.embeddingModel);
} else {
  setEmbeddingModel("");
}
```
Check the `EffectiveSettings` interface to confirm the field name and source field exist. If not, check what the GET /api/settings returns for embedding model info.

### 2. Query: No `AbortController` on streaming fetch
In `handleQuery` (around line 50-100), the streaming fetch has a `while(true)` reader loop. If the user navigates away or submits a new query, the loop continues calling `setResult` on an unmounted component. Fix:
- Create an `AbortController` at the start of `handleQuery`
- Pass `{ signal: controller.signal }` to the `fetch` call
- Store the controller in a ref so it persists across renders
- On component unmount (useEffect cleanup), abort
- On new query submission, abort any previous controller before starting

### 3. Query: `JSON.parse(sourcesHeader)` with no try/catch
Around line 72, `JSON.parse(sourcesHeader)` can throw if the header is malformed. Wrap in try/catch with fallback to empty array.

### 4. Ingest: "Ingest directly" button bypasses form validation
The "Ingest directly →" button at line ~460 uses `type="button"` and `onClick={handleDirectIngest}`. Since it's not `type="submit"`, HTML5 required-field validation doesn't fire. Fix by adding explicit validation at the top of `handleDirectIngest`:
- For URL mode: check that `url` is non-empty and looks like a URL
- For text mode: check that `title` and `content` are non-empty
- If validation fails, set error state and return early

## Verification
```
pnpm build && pnpm lint && pnpm test
```
