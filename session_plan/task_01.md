Title: Extract getErrorMessage utility and adopt across API routes
Files: src/lib/errors.ts (create), src/lib/__tests__/errors.test.ts (create), src/app/api/ingest/route.ts, src/app/api/ingest/batch/route.ts, src/app/api/query/route.ts, src/app/api/query/stream/route.ts, src/app/api/query/save/route.ts, src/app/api/query/history/route.ts, src/app/api/wiki/route.ts, src/app/api/wiki/[slug]/route.ts, src/app/api/wiki/graph/route.ts, src/app/api/wiki/search/route.ts, src/app/api/raw/[slug]/route.ts, src/app/api/lint/route.ts, src/app/api/lint/fix/route.ts, src/app/api/settings/route.ts, src/app/api/settings/rebuild-embeddings/route.ts
Issue: none

## Description

The pattern `err instanceof Error ? err.message : "fallback"` is repeated 25+ times across the codebase, with 3 variations:
- `error instanceof Error ? error.message : "Internal server error"` (API routes)
- `err instanceof Error ? err.message : "unknown error"` (API routes)
- `err instanceof Error ? err.message : "Failed to ..."` (components)

### What to build

1. **Create `src/lib/errors.ts`** with:
   ```ts
   export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
     if (error instanceof Error) return error.message;
     if (typeof error === "string") return error;
     return fallback;
   }
   ```

2. **Create `src/lib/__tests__/errors.test.ts`** with tests covering:
   - `Error` instance → returns `.message`
   - String → returns the string
   - `null` / `undefined` / `{}` / number → returns fallback
   - Custom fallback message
   - Edge case: Error with empty message

3. **Update ALL API route files** (listed above, ~15 files) to import and use `getErrorMessage` instead of inline `instanceof Error` checks. Each route file is a small mechanical replacement — find the catch block, replace the ternary with `getErrorMessage(error)` or `getErrorMessage(error, "specific fallback")`.

   Example transformation:
   ```ts
   // Before
   catch (error) {
     return Response.json(
       { error: error instanceof Error ? error.message : "Internal server error" },
       { status: 500 }
     );
   }

   // After  
   import { getErrorMessage } from "@/lib/errors";
   // ...
   catch (error) {
     return Response.json(
       { error: getErrorMessage(error) },
       { status: 500 }
     );
   }
   ```

4. **Also update `src/lib/llm.ts`** — the `retryWithBackoff` function has `err instanceof Error ? err.message : String(err)` which maps to `getErrorMessage(error, String(error))`.

5. **Also update `src/lib/lifecycle.ts`** — has 2 instances.

**Do NOT update page components or UI components in this task** — those will be handled when the Alert component is introduced in task 2.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All 583 existing tests should pass. The new errors.test.ts should add ~6-8 tests.
