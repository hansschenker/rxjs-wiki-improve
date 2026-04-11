Title: Support creating new wiki pages from scratch
Files: src/app/wiki/new/page.tsx (create), src/app/api/wiki/route.ts (create), src/components/WikiEditor.tsx (modify)
Issue: none

## Description

Users currently cannot create a wiki page without ingesting a source document. The founding vision says the wiki is "LLM-generated", but editing is already supported — the gap is that there's no way to create a blank new page or navigate to a creation form. This is gap #2 from the assessment.

### Steps

1. **Create `src/app/api/wiki/route.ts`** — a POST endpoint to create new pages:

   ```ts
   // POST /api/wiki
   // Body: { slug: string, content: string }
   // Returns: { slug, title, ... } on success
   ```

   - Validate slug (use existing `validateSlug()` from wiki.ts)
   - Check the slug doesn't already exist (return 409 Conflict if it does)
   - Derive title from first H1 heading in content (like PUT does)
   - Derive summary via `extractSummary()`
   - Build frontmatter with `created` date
   - Call `writeWikiPageWithSideEffects()` with `logOp: "ingest"` and cross-ref discovery enabled
   - Return the result as JSON

   Keep it under 80 lines. Pattern after the existing PUT handler in `src/app/api/wiki/[slug]/route.ts`.

2. **Create `src/app/wiki/new/page.tsx`** — a page creation form:

   - Title input field that auto-generates the slug (lowercase, hyphenated)
   - Show the generated slug with option to edit it
   - Markdown content textarea (can reuse patterns from WikiEditor)
   - "Create" button that POSTs to `/api/wiki`
   - On success, redirect to the new page
   - On error (409 conflict, validation), show inline error message
   - Must be a client component ("use client")

   Keep it under 150 lines.

3. **Update `src/components/WikiEditor.tsx`** — Add a "New page" link/button somewhere visible. Actually, the better place is the wiki index. But the task should add a link in the NavHeader or wiki index. 

   Actually, simpler approach: just add a "New page" link in the wiki index page. The `WikiIndexClient.tsx` already has the header area. Add a `+ New page` button/link next to the search bar that links to `/wiki/new`.

   **Revised file list**: modify `src/components/WikiIndexClient.tsx` instead of `WikiEditor.tsx` to add the "New page" link.

### Design Notes

- Slug generation: take the title, lowercase it, replace spaces/special chars with hyphens, remove consecutive hyphens, trim hyphens from ends. Show a preview like "Will be created as: my-page-title"
- The content textarea should include a placeholder with example markdown structure (heading + summary paragraph)
- Match existing form styling from ingest and query pages

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Manually verify: navigate to `/wiki/new`, ensure the form renders, ensure the build compiles the new route.
