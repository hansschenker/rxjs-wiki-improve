Title: Extract lint-fix business logic into a testable library module
Files: src/lib/lint-fix.ts (create), src/lib/__tests__/lint-fix.test.ts (create), src/app/api/lint/fix/route.ts (modify)
Issue: none

## Description

The `src/app/api/lint/fix/route.ts` API handler contains 235 lines of business logic for fixing lint issues (orphan-page, stale-index, empty-page, missing-crossref). This logic is untestable in isolation because it's entangled with HTTP request/response handling. Extract it into a library module.

### Steps

1. **Create `src/lib/lint-fix.ts`** with these exported functions:

   ```ts
   interface FixResult {
     success: boolean;
     slug: string;
     message: string;
   }

   async function fixOrphanPage(slug: string): Promise<FixResult>
   async function fixStaleIndex(slug: string): Promise<FixResult>
   async function fixEmptyPage(slug: string): Promise<FixResult>
   async function fixMissingCrossRef(slug: string, targetSlug: string): Promise<FixResult>
   async function fixLintIssue(type: string, slug: string, targetSlug?: string): Promise<FixResult>
   ```

   Move all the business logic (reading pages, updating index, inserting cross-references, etc.) from the route handler into these functions. The functions should throw on validation errors (missing slug, page not found) rather than returning HTTP responses.

2. **Rewrite `src/app/api/lint/fix/route.ts`** to be a thin HTTP adapter:
   - Parse the request body
   - Call `fixLintIssue()` from the library module
   - Map thrown errors to appropriate HTTP status codes (400/404/500)
   - Return JSON responses

   The route handler should be ~30 lines, not 235.

3. **Create `src/lib/__tests__/lint-fix.test.ts`** with tests covering:
   - `fixOrphanPage`: page not found error, successful add to index
   - `fixStaleIndex`: slug not in index (no-op), successful removal
   - `fixEmptyPage`: delegates to deleteWikiPage
   - `fixMissingCrossRef`: missing slug/targetSlug errors, already linked (no-op), inserts link into existing Related section, creates new Related section
   - `fixLintIssue`: dispatches to correct function, unknown type throws

   Mock `wiki.ts` and `lifecycle.ts` functions as done in other test files.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All existing lint-fix behavior must be preserved — this is a pure refactor.
