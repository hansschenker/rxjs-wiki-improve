Title: Fix error handling bugs in API routes and components
Files: src/app/api/status/route.ts, src/app/api/wiki/export/route.ts, src/components/StatusBadge.tsx, src/app/wiki/graph/page.tsx, SCHEMA.md
Issue: none

## Description

Fix the 5 bugs/friction items identified in the assessment:

### 1. `GET /api/status` — no try/catch (src/app/api/status/route.ts)
Wrap `getProviderInfo()` in a try/catch so if it throws, we return a structured JSON error with status 500 instead of a raw uncaught exception.

```ts
export async function GET() {
  try {
    const info = getProviderInfo();
    return Response.json(info);
  } catch (err) {
    return Response.json(
      { configured: false, provider: null, model: null, embeddingSupport: false, error: String(err) },
      { status: 500 }
    );
  }
}
```

### 2. `GET /api/wiki/export` — no top-level try/catch (src/app/api/wiki/export/route.ts)
Wrap the whole handler in try/catch. `listWikiPages()` and `readWikiPage()` can throw on filesystem errors. Return a 500 JSON response on failure.

### 3. StatusBadge silently disappears on error (src/components/StatusBadge.tsx)
Currently when fetch fails, `error` is set to true and the component returns `null`. Instead, show a small inline error indicator so users know something went wrong rather than seeing nothing:
```tsx
if (error) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-500/60">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
      Unable to check provider status
    </div>
  );
}
```

### 4. Graph view swallows fetch errors (src/app/wiki/graph/page.tsx)
Find the catch block that only logs to `console.error` and add user-visible error state. Add an `error` state variable, set it in the catch, and render an error message in the UI when it's set.

### 5. SCHEMA.md stale known-gaps entry (SCHEMA.md)
The "Known gaps" section says "Batch rebuild of the full vector index is not yet supported" but this was implemented in session 2026-04-11 05:22 (`/api/settings/rebuild-embeddings` + UI button). Update the bullet to reflect reality: vector store batch rebuild is available via the Settings page.

## Verification
```
pnpm build && pnpm lint && pnpm test
```
All 5 changes are non-breaking — they only add error handling or fix documentation.
