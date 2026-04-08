Title: Edit flow for wiki pages
Files: src/app/api/wiki/[slug]/route.ts, src/app/wiki/[slug]/edit/page.tsx, src/app/wiki/[slug]/page.tsx, src/lib/__tests__/wiki.test.ts, src/lib/wiki.ts

Issue: none

## Context

From the assessment:

> **No edit flow for wiki pages.** `ingest` and `saveAnswerToWiki` can create,
> `deleteWikiPage` can destroy, but there is no way to update an existing
> page's content through the UI. The learnings file's "Delete is a write-path
> too" note explicitly envisioned edit as the next op to flow through
> `writeWikiPageWithSideEffects` — and the function itself already does upsert
> (if the slug exists, it just refreshes title/summary). Missing is UI + an
> API route. This would round out CRUD.

The unified write pipeline `writeWikiPageWithSideEffects` in `src/lib/wiki.ts`
already handles upsert correctly:
- It calls `writeWikiPage` which overwrites
- It re-reads the index and re-uses an existing entry (won't duplicate rows)
- It runs cross-ref discovery against the new content
- It appends a log entry using whatever `logOp` the caller passes

So "edit" is almost entirely plumbing: add a log op, add an API route, add a
page that renders a `<textarea>`. Keep this task tight — **no markdown editor
libraries**, just a plain textarea. Fancy editors can come later.

## Prerequisite

**Task 01 should land first** (adds `"delete"` to `LogOperation`). This task
adds `"edit"` the same way. If task 01 hasn't landed when you start, just
add both `"delete"` and `"edit"` in the same spot and coordinate commits.

## Task

### Step 1 — add `"edit"` to `LogOperation` (src/lib/wiki.ts)

Mirror whatever task 01 did for `"delete"`:
- Add `"edit"` to the `LogOperation` type union (put it next to `"save"`)
- Add `"edit"` to `ALLOWED_LOG_OPERATIONS`

### Step 2 — PUT handler on the slug API route (src/app/api/wiki/[slug]/route.ts)

The file currently only exports `DELETE`. Add a `PUT` handler:

```ts
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) { ... }
```

Behavior:
1. `await params` to get `slug`.
2. `const body = await req.json()` — expect `{ content: string }`.
3. Validate `content` is a non-empty string; 400 on failure.
4. Call `readWikiPage(slug)` first. If it returns `null`, respond 404.
   (Edit ≠ create; we want a clear error when the slug doesn't exist.)
5. Derive the new `title` by matching `^#\s+(.+)$` on the new content
   (same logic `readWikiPage` uses). Fall back to the old title if no H1.
6. Derive `summary` using `extractSummary` from `src/lib/ingest.ts`. If
   importing `extractSummary` causes a circular-import problem, inline the
   "first non-heading paragraph, first 200 chars" logic directly — it's short.
7. Call `writeWikiPageWithSideEffects({ slug, title, content, summary,
   logOp: "edit", logDetails: (ctx) => \`edited · updated ${ctx.updatedSlugs.length} cross-ref(s)\` })`.
8. Return the result as JSON.
9. Wrap in try/catch; return `{ error }` with appropriate status (400 for bad
   input, 500 for unexpected errors, 404 for not-found).

**Do not** add a POST handler. Edit is a PUT on an existing slug.

### Step 3 — edit page (src/app/wiki/[slug]/edit/page.tsx)

Create a new route at `/wiki/[slug]/edit`. Server component that:
1. Reads `params.slug`, calls `readWikiPage(slug)`.
2. If null, shows a "Page not found" message with a link back to `/wiki`.
3. Otherwise renders a client component wrapping:
   - An `<h1>` "Editing: {title}"
   - A `<textarea>` pre-filled with `page.content`, full width, min-height
     ~500px, monospace font, styled like the rest of the app (follow
     `src/app/ingest/page.tsx` for form styling conventions)
   - A "Save" button that PUTs to `/api/wiki/${slug}` with
     `{ content: textareaValue }`
   - On success, navigate to `/wiki/${slug}` (use `router.push` from
     `next/navigation`)
   - Error banner on failure (follow the ingest page's error state pattern)
   - A "Cancel" link back to `/wiki/${slug}`

You can put the client component inline in a single file by using a
separate `"use client"` component defined in the same edit page file is
Next.js-disallowed — so either:
- Make the whole `page.tsx` a `"use client"` component that takes
  `params` and fetches its own initial state via a short server-render
  data attribute, **OR**
- Extract a small client component e.g. `src/components/WikiEditor.tsx`
  and have the server page render it with `initialContent` and `slug`
  props. **Prefer this approach** — keeps the server/client boundary clean
  and matches the rest of the codebase (see `DeletePageButton.tsx`).

If you create `WikiEditor.tsx`, that counts as a 6th file — in that case,
**drop the change to `src/lib/__tests__/wiki.test.ts` from this task** and
leave the LogOperation enum test to be inherited from task 01, since task
01 already exercises that branch. Prioritize keeping files ≤ 5.

**Final file budget (pick one):**
- Option A (5 files): route.ts, edit/page.tsx, wiki/[slug]/page.tsx,
  wiki.ts, wiki.test.ts — put the client component inline in edit/page.tsx
  with `"use client"` at the top.
- Option B (5 files): route.ts, edit/page.tsx, components/WikiEditor.tsx,
  wiki/[slug]/page.tsx, wiki.ts — no test file changes; verify via build/lint/test.

**Recommend Option B.** It matches the DeletePageButton pattern.

### Step 4 — Edit button on the page view (src/app/wiki/[slug]/page.tsx)

Add a simple `<Link href={\`/wiki/${slug}/edit\`}>Edit</Link>` next to
the `<DeletePageButton />`. Style it as a plain link/button matching the
delete button's visual weight but in a neutral colour (not red).

### Step 5 — tests (src/lib/__tests__/wiki.test.ts) [Option A only]

If you pick Option A, add one test that:
- Writes a page via `writeWikiPageWithSideEffects` with `logOp: "edit"`
- Reads back `log.md` and asserts the heading contains `"] edit |"`

Skip this under Option B to stay within 5 files.

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Manual smoke (optional if you have an LLM key): start `pnpm dev`, ingest
a page, navigate to it, click "Edit", change the content, hit save, verify
the page now shows the new content and `/wiki/log` has an `edit` entry.

## Commit message

```
yoyo: edit flow for wiki pages

Add PUT /api/wiki/[slug], /wiki/[slug]/edit page with a plain textarea,
and an Edit button on the page view. Edits route through the unified
writeWikiPageWithSideEffects pipeline, so the index, cross-refs, and
activity log all stay consistent.
```

## Out of scope

- Rich markdown editor / preview pane.
- Diff view between before/after.
- Optimistic concurrency (last-write-wins is fine for single-user local).
- Auto-save / draft persistence.
- Editing raw sources (raw layer is immutable by design).
