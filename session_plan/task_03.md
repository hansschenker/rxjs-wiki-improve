Title: Contradiction auto-fix in lint-fix
Files: src/lib/lint-fix.ts, src/lib/__tests__/lint-fix.test.ts, src/app/api/lint/fix/route.ts, src/app/lint/page.tsx
Issue: none

## Description

Implement the last missing lint auto-fix type: contradiction resolution. This has
been flagged as "next item" in the journal for 5+ consecutive sessions but never
tackled. Currently `fixLintIssue("contradiction", ...)` throws
`FixValidationError("Auto-fix not supported for this issue type")`.

### Changes

**1. src/lib/lint-fix.ts** — Add `fixContradiction()` + update dispatcher

Add a new function `fixContradiction(slug: string, message: string)`:
1. Parse the contradiction `message` to extract the second slug. The message format
   from `parseContradictionResponse` in lint.ts is like:
   `"Contradiction between slug-a and slug-b: Page A says X while Page B says Y"`
   Use a regex to extract the other slug, or if the message contains the info inline.
   
   Actually, look at how contradiction issues are created in lint.ts to understand
   the message format. The slug is set to a comma-separated list of page slugs, and
   the message is the description. So we need `slug` (which is the first page) and
   to extract the target from the issue. OR: add a `targetSlug` parameter.

   Checking lint.ts more carefully: each contradiction issue has `slug` set to the
   first page slug and the message contains info about both pages. The second page
   slug needs to be passed separately — either parse it from the message or pass it
   as `targetSlug`.

   **Approach:** Use the existing `targetSlug` parameter that the dispatcher already
   accepts. The lint page will send `targetSlug` for contradiction issues just like
   it does for missing-crossref issues. Additionally pass `message` so the LLM
   understands what the contradiction is.

2. `fixContradiction(slug, targetSlug, message)`:
   - Validate slug and targetSlug are non-empty
   - Read both pages via `readWikiPage`
   - Call `callLLM()` with a prompt asking it to rewrite the first page to resolve
     the contradiction. The prompt should include both pages' content and the
     description of the conflict.
   - Write the updated page via `writeWikiPageWithSideEffects`
   - Return FixResult

3. Update `fixLintIssue` dispatcher:
   - Add `message?: string` as a 4th parameter
   - Route `"contradiction"` to `fixContradiction(slug, targetSlug!, message!)`

**2. src/app/api/lint/fix/route.ts** — Pass `message` from request body

Update the destructuring to include `message`:
```ts
const { type, slug, targetSlug, message } = body;
const result = await fixLintIssue(type, slug, targetSlug, message);
```

Update the JSDoc to document the contradiction request body format.

**3. src/app/lint/page.tsx** — Enable contradiction fix button

Two changes:
1. Add `"contradiction"` to the `fixableTypes` set (~line 222)
2. In `handleFix`, when the issue type is `"contradiction"`, extract the target slug
   from the issue and pass both `targetSlug` and `message` in the request body.

   The contradiction issue's message is from `parseContradictionResponse` in lint.ts.
   Look at how the issue is constructed to find where the second slug lives — it may
   be in the message text or we may need to parse it.

   Check lint.ts around line 327-334 to see the issue construction:
   ```
   issues.push({
     type: "contradiction",
     slug: affectedSlug,           // c.pages[0]
     message: `Contradiction between ${c.pages.join(", ")}: ${c.description}`,
     severity: "warning",
   });
   ```
   
   So the message format is `"Contradiction between slug-a, slug-b: description"`.
   In the lint page, extract the target slug with:
   `issue.message.match(/^Contradiction between \S+, (\S+):/)?.[1]`
   
   Pass this as `targetSlug` in the fix request, along with `message: issue.message`.

**4. src/lib/__tests__/lint-fix.test.ts** — Add tests

Mock `callLLM` from `../llm` (vi.mock pattern already used in this file).

Tests to add:
- `fixContradiction` calls LLM with both pages' content and the contradiction description
- `fixContradiction` writes the rewritten page via lifecycle pipeline  
- `fixContradiction` throws FixNotFoundError if either page doesn't exist
- `fixContradiction` throws FixValidationError if slug or targetSlug is empty
- `fixLintIssue("contradiction", slug, targetSlug, message)` dispatches correctly

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```
