Title: YAML frontmatter on wiki pages
Files: src/lib/wiki.ts, src/lib/ingest.ts, src/lib/__tests__/wiki.test.ts, src/lib/__tests__/ingest.test.ts, src/components/MarkdownRenderer.tsx

Issue: none

## Context

From `SCHEMA.md` "Known gaps" and the assessment:

> **No YAML frontmatter on wiki pages.** SCHEMA.md lists this first in Known
> gaps. Adding tags, ingest date, and source count frontmatter would (a) give
> Obsidian users Dataview compatibility, (b) enable tag-based browsing /
> filtering in the UI, and (c) unlock "what's new" or "stale" surfaces
> without re-scanning every file.

This task adds the **parsing + writing** layer only. UI surfaces for tags,
stale detection, etc. come later once frontmatter is actually in every new
page.

## Task scope — keep it minimal

Do NOT try to:
- Backfill existing pages with frontmatter (out of scope; too risky)
- Build a tag index page
- Parse tags into search
- Add an ingest-date column to the index

DO add:
- A `parseFrontmatter(content)` helper that returns `{ data, body }`
- A `serializeFrontmatter(data, body)` helper that renders a markdown
  string with a `---\n...\n---\n\n` header prepended
- New-page writes from `ingest()` include an auto-populated frontmatter
  block: `created`, `updated`, `source_count`, `tags` (empty array by default)
- `readWikiPage` exposes parsed frontmatter on the returned `WikiPage`
- `MarkdownRenderer` strips the frontmatter before rendering (so users
  don't see raw YAML in their rendered page)

### Step 1 — add frontmatter helpers to `src/lib/wiki.ts`

No new deps. Write a tiny hand-rolled YAML parser that only supports the
three value types we need:

- String scalars: `key: "value"` or `key: value` (trim, strip surrounding quotes)
- ISO dates / numbers: `key: 2026-04-08` or `key: 3` (kept as strings, parse at the call site)
- Inline arrays of strings: `tags: [a, b, "c d"]`

Reject nested objects, block scalars, anchors, and multi-line strings —
throw on anything we don't recognize. This is a constrained subset by
design; we want predictable round-tripping, not full YAML.

Sketch:

```ts
export interface Frontmatter {
  [key: string]: string | string[];
}

export interface ParsedPage {
  data: Frontmatter;
  body: string;
}

/**
 * Parse a markdown document that may begin with a `---\n...\n---\n` YAML
 * frontmatter block. Returns empty data and the full content as body when
 * no frontmatter is present. Throws on malformed frontmatter.
 */
export function parseFrontmatter(content: string): ParsedPage { ... }

/**
 * Serialize a frontmatter object + body back into a markdown document.
 * The frontmatter block is omitted when `data` is empty.
 */
export function serializeFrontmatter(data: Frontmatter, body: string): string { ... }
```

Implementation notes:
- Parser: check if the first line is exactly `---`. If not, return
  `{ data: {}, body: content }`. Otherwise find the next `---` line and
  parse the lines between them as `key: value` pairs.
- Array values: detect leading `[` and trailing `]`, split on commas,
  trim each, strip surrounding quotes from each.
- Serializer: emit keys in insertion order. Strings never get quoted
  unless they contain `:` or start with `[` (then wrap in `"..."`).
  Arrays always use inline `[a, b, c]` form.

### Step 2 — `readWikiPage` returns the parsed frontmatter

Update `WikiPage` in `src/lib/types.ts`:

```ts
export interface WikiPage {
  slug: string;
  title: string;
  content: string;          // full markdown including frontmatter
  body: string;             // markdown with frontmatter stripped
  frontmatter: Frontmatter; // parsed {} if none present
  path: string;
}
```

Update `readWikiPage` in `src/lib/wiki.ts` to populate `body` and
`frontmatter` via `parseFrontmatter`. Derive `title` from the first H1 in
`body` (not `content`) so frontmatter can't accidentally contribute.

**Watch out**: other call sites read `page.content` expecting the
full markdown. That's fine — `content` is still the full doc. But places
that want to render the visible body should now use `page.body`.

### Step 3 — `MarkdownRenderer` strips frontmatter

`src/components/MarkdownRenderer.tsx` currently passes `content` straight to
`react-markdown`. Add a preprocessing step that strips a leading
`---\n...\n---\n\n?` block before rendering. Use a simple regex:
`/^---\n[\s\S]*?\n---\n?/`. No need to import `parseFrontmatter` — we
just want to hide the YAML in the rendered output.

This means the `/wiki/[slug]` page doesn't need to change — it can keep
passing `page.content` to the renderer.

### Step 4 — ingest populates frontmatter on new pages

In `src/lib/ingest.ts`, the current flow synthesizes a markdown page and
calls `writeWikiPageWithSideEffects({ content, ... })`. Before passing
`content`, build a frontmatter block:

```ts
const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const frontmatter: Frontmatter = {
  created: now,
  updated: now,
  source_count: "1",
  tags: [],
};
const contentWithFm = serializeFrontmatter(frontmatter, pageMarkdown);
```

Pass `contentWithFm` as the `content` in the write call. Leave `title`
and `summary` derivation alone — they can still come from the body.

Edge case: if the page already exists (re-ingest of the same slug), we
want `created` to be preserved but `updated` to advance and `source_count`
to increment. Read the existing page first:

```ts
const existing = await readWikiPage(slug);
if (existing && existing.frontmatter) {
  frontmatter.created = String(existing.frontmatter.created ?? now);
  const prev = Number(existing.frontmatter.source_count ?? 0);
  frontmatter.source_count = String(prev + 1);
  // preserve user-edited tags if present
  if (Array.isArray(existing.frontmatter.tags)) {
    frontmatter.tags = existing.frontmatter.tags;
  }
}
```

Do this **only in `ingest()`**. Do NOT add frontmatter to
`saveAnswerToWiki` or the forthcoming edit route in this task — those can
be wired up in follow-up work. Keeping the blast radius small.

### Step 5 — tests

Add tests to **`src/lib/__tests__/wiki.test.ts`**:
- `parseFrontmatter`: returns empty data when no frontmatter
- `parseFrontmatter`: parses string, array, numeric-looking scalars
- `parseFrontmatter`: throws on malformed block (unclosed `---`, nested objects)
- `serializeFrontmatter`: round-trips through `parseFrontmatter`
- `readWikiPage`: exposes `body` and `frontmatter` fields; `body` excludes the YAML block

Add tests to **`src/lib/__tests__/ingest.test.ts`**:
- Ingesting new text produces a page whose content starts with `---\n`
- The frontmatter includes `created`, `updated`, `source_count: 1`, `tags: []`
- Re-ingesting the same slug increments `source_count` and preserves `created`

Update existing tests that do `expect(page.content).toMatch(/^# /)` or
similar strict H1-at-start assertions — those will now fail because
`content` starts with `---`. Either:
- Update them to check `page.body` instead, OR
- Update them to check `page.content` matches `/^---[\s\S]*?\n# /`

Prefer the first — it's the cleaner long-term assertion.

## File budget check

This task touches 5 files:
1. `src/lib/wiki.ts` (parser + reader update + Frontmatter type)
2. `src/lib/ingest.ts` (populate frontmatter)
3. `src/lib/__tests__/wiki.test.ts` (parser tests + reader tests)
4. `src/lib/__tests__/ingest.test.ts` (ingest frontmatter tests + fixes)
5. `src/components/MarkdownRenderer.tsx` (strip frontmatter on render)

`src/lib/types.ts` update is necessary too — that would make it 6 files.
**Resolution**: move the `Frontmatter` / `ParsedPage` interfaces into
`src/lib/wiki.ts` and update the `WikiPage` interface *in place in
types.ts* by importing `Frontmatter` from wiki.ts. That's still 6 files.

**Alternative**: keep the `WikiPage` interface unchanged in types.ts.
Return the frontmatter-enriched page from a new helper
`readWikiPageWithFrontmatter` and have `readWikiPage` stay as it is. Then
`src/lib/types.ts` is untouched.

**Go with the alternative**: add `readWikiPageWithFrontmatter` as a new
export. Leave `readWikiPage` and `WikiPage` untouched. Callers that need
frontmatter import the new helper; nothing else changes. This keeps the
file budget at 5 and the blast radius tiny.

Revised file list:
1. `src/lib/wiki.ts` — add parser, serializer, `readWikiPageWithFrontmatter`
2. `src/lib/ingest.ts` — call parser on re-ingest, serialize on write
3. `src/lib/__tests__/wiki.test.ts` — parser + helper tests
4. `src/lib/__tests__/ingest.test.ts` — ingest frontmatter tests + any fix-ups
5. `src/components/MarkdownRenderer.tsx` — strip `---...---` block

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All existing tests must still pass. The lint rule list should be unchanged.
Visual check with `pnpm dev`: ingest a page, navigate to `/wiki/<slug>`,
verify no raw YAML is visible. Open the raw `.md` file on disk, verify the
frontmatter block is there.

## Commit message

```
yoyo: YAML frontmatter on ingested wiki pages

Add a constrained frontmatter parser/serializer (wiki.ts) and start
writing created/updated/source_count/tags headers on every new ingest.
Re-ingesting the same slug preserves `created` and increments
`source_count`. MarkdownRenderer strips the block before rendering so
users never see raw YAML in the browser. Existing pages remain
unchanged — backfill is deliberately out of scope.
```

## Out of scope (do NOT do)

- Backfilling frontmatter on existing pages
- Adding frontmatter to saved answers or the edit flow (followups)
- Tag-based search / filtering UI
- Dataview-style querying
- Treating `tags` as first-class in the index
- Installing `gray-matter` or any YAML library — roll our own minimal parser
