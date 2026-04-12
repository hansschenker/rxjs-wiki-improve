Title: Fix slugify inconsistency — extract shared utility
Files: src/lib/slugify.ts (new), src/lib/ingest.ts, src/app/wiki/new/page.tsx, src/lib/__tests__/slugify.test.ts (new)
Issue: none

## Problem

Two divergent `slugify()` implementations:

**`src/lib/ingest.ts:34`** (server-side):
```ts
export function slugify(title: string): string {
  return title.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

**`src/app/wiki/new/page.tsx:7`** (client-side):
```ts
function slugify(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}
```

Key differences:
1. Client version collapses consecutive hyphens (`/-{2,}/g`), server doesn't
2. Server version `.trim()`s first, client doesn't
3. Server strips leading/trailing with `^-+|-+$`, client with `^-|-$` (only single dash)

A title like `"hello--world"` produces `"hello--world"` server-side but `"hello-world"` client-side.

## Implementation

1. Create `src/lib/slugify.ts` with a single canonical `slugify()`:
   - `.toLowerCase().trim()`
   - Replace non-alphanumeric runs with single hyphen: `.replace(/[^a-z0-9]+/g, "-")`
   - Strip leading/trailing hyphens: `.replace(/^-+|-+$/g, "")`
   - Note: The `[^a-z0-9]+` regex already collapses consecutive non-alphanum chars into a single `-`, so `"hello--world"` → `"hello-world"` without needing a separate dedup step. The server version was already correct for this case; the issue was the client using a different flow.

2. Update `src/lib/ingest.ts`:
   - Remove the `slugify` function definition
   - Add `import { slugify } from "./slugify"` (and re-export it for existing importers)
   - Keep the `export { slugify }` re-export since other files import from ingest

3. Update `src/app/wiki/new/page.tsx`:
   - Remove the local `slugify` function
   - Import from `@/lib/slugify`

4. Create `src/lib/__tests__/slugify.test.ts`:
   - Test basic slugification
   - Test consecutive special chars collapse to single hyphen
   - Test leading/trailing hyphen stripping
   - Test whitespace trimming
   - Test empty string
   - Test already-valid slug passthrough

5. Check for any other files importing `slugify` from `ingest.ts` and update if needed.

## Verification

```bash
pnpm build && pnpm lint && pnpm test
```
