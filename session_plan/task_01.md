Title: Add broken-link lint check with auto-fix
Files: src/lib/types.ts, src/lib/lint.ts, src/lib/lint-fix.ts, src/app/lint/page.tsx, src/lib/__tests__/lint.test.ts
Issue: none

## Description

Add a "broken-link" lint check that detects internal wiki links pointing to non-existent pages, and an auto-fix that removes the broken link (replacing `[text](slug.md)` with just `text`).

This is gap #2 from the assessment: "Lint detects orphan pages, stale index entries, and missing cross-refs, but doesn't check for **broken links** (references to `slug.md` where no such file exists). This is table-stakes for wiki health."

### Implementation steps

1. **`src/lib/types.ts`** — Add `"broken-link"` to the `LintIssue.type` union:
   ```ts
   type: "orphan-page" | "stale-index" | "missing-crossref" | "empty-page" | "contradiction" | "missing-concept-page" | "broken-link";
   ```

2. **`src/lib/lint.ts`** — Add `checkBrokenLinks(diskSlugs: string[])` function:
   - For each page on disk, read its content
   - Extract all internal links matching `/\[([^\]]*)\]\(([^)]+)\.md\)/g`
   - For each linked slug, check if it exists in the `diskSlugSet`
   - If not, emit a `broken-link` issue with severity `"warning"`, message like: `Page "foo.md" links to "nonexistent.md" which does not exist`
   - Include the target slug info in the message so the fix handler and UI can parse it
   - Wire into the main `lint()` function's parallel structural checks (alongside orphans, stale, empty, crossRefs)

3. **`src/lib/lint-fix.ts`** — Add `fixBrokenLink(slug: string, targetSlug: string)`:
   - Read the page content
   - Replace all `[text](targetSlug.md)` with just `text` (the link text without the link)
   - Write the page back via `writeWikiPageWithSideEffects`
   - Return FixResult with action describing what was done
   - Wire into `fixLintIssue` switch statement with `case "broken-link":`

4. **`src/app/lint/page.tsx`** — Add a `parseTargetSlugFromBrokenLink` helper (similar to existing `parseTargetSlug`) that extracts the broken target from the message. Wire it into the fix button dispatch so the `targetSlug` parameter is passed correctly.

5. **`src/lib/__tests__/lint.test.ts`** — Add tests:
   - Page with a link to a non-existent page → produces broken-link issue
   - Page with a link to an existing page → no broken-link issue
   - Page with multiple broken links → produces one issue per broken link
   - Links to infrastructure files (index.md, log.md) should NOT be flagged

### Verification
```
pnpm build && pnpm lint && pnpm test
```
