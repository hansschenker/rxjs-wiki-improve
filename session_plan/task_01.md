Title: Fix log format to match founding spec + render structured log
Files: src/lib/wiki.ts, src/lib/__tests__/wiki.test.ts, src/app/wiki/log/page.tsx
Issue: none

# Background

`llm-wiki.md` line 53 gives an exact log format recommendation:

> if each entry starts with a consistent prefix (e.g. `## [2026-04-02] ingest | Article Title`),
> the log becomes parseable with simple unix tools — `grep "^## \[" log.md | tail -5`
> gives you the last 5 entries.

Current implementation in `src/lib/wiki.ts:169-174` writes flat lines:

```ts
await fs.appendFile(logPath, `[${timestamp}] ${entry}\n`, "utf-8");
```

That produces e.g. `[2026-04-07T01:50:12.345Z] Ingested "Foo" as foo, ...` which is:
1. Not a markdown heading — won't match `grep "^## \["`.
2. Renders as one giant paragraph blob in `/wiki/log` because `MarkdownRenderer` collapses adjacent lines.
3. Doesn't carry the operation kind (`ingest` / `query` / `lint`) as a first-class field.

# What to build

## 1. Update `appendToLog` in `src/lib/wiki.ts`

Change the signature to accept a structured entry:

```ts
export type LogOperation = "ingest" | "query" | "lint" | "save" | "other";

export async function appendToLog(
  operation: LogOperation,
  title: string,
  details?: string,
): Promise<void>
```

Behavior:
- Use `new Date().toISOString().slice(0, 10)` for the date (`YYYY-MM-DD`) — matches the spec exactly. Keep the full ISO timestamp inside the body if you want, but the heading uses just the date.
- Write a markdown H2 heading line plus an optional details line plus a blank line:

```
## [2026-04-07] ingest | Article Title

<details if provided>

```

So the file contains a sequence of H2-headed entries separated by blank lines. `grep "^## \[" log.md` will return one line per entry.
- Validate `operation` is one of the allowed values; throw if not.
- Validate `title` is non-empty after trimming; throw if it is.
- The details line is optional. If omitted, just write the heading + blank line.

## 2. Update the two callers

- `src/lib/ingest.ts:427` — currently:
  ```ts
  await appendToLog(
    `Ingested "${title}" as ${slug}, updated ${updatedSlugs.length} related pages`,
  );
  ```
  Change to:
  ```ts
  await appendToLog(
    "ingest",
    title,
    `slug: ${slug} · updated ${updatedSlugs.length} related page(s)`,
  );
  ```

- `src/lib/query.ts:335` — currently:
  ```ts
  await appendToLog(`Saved query answer "${title}" as ${slug}`);
  ```
  Change to:
  ```ts
  await appendToLog("save", title, `query answer saved as ${slug}`);
  ```

## 3. Update `/wiki/log` page rendering

`src/app/wiki/log/page.tsx` currently pipes the raw log through `MarkdownRenderer`. With the new H2-heading format, MarkdownRenderer will already render it as a list of headings + paragraphs, which is a huge improvement. Verify it looks decent — H2s become section headers, the optional details line becomes a paragraph below each. No structural changes needed unless rendering is broken; if so, render headings as a styled list manually (parse with a simple regex that splits on `^## \[`).

Make sure the page handles empty/missing log gracefully (it already does — keep that behavior).

## 4. Update tests in `src/lib/__tests__/wiki.test.ts`

Existing tests at lines 123-148 call `appendToLog("first entry")` / `appendToLog("test entry")` — those will break. Update them to use the new signature:

```ts
await appendToLog("ingest", "first entry");
await appendToLog("ingest", "second entry");
```

Add new assertions:
- The log file contains lines starting with `## [` followed by an ISO date `\d{4}-\d{2}-\d{2}\]`.
- The operation kind appears after the date.
- The title appears after `| `.
- A `grep "^## \["`-style regex match returns exactly N lines for N appended entries.
- Calling with an invalid operation throws.
- Calling with an empty title throws.
- A call with `details` produces a body line; without `details` produces no body line.

Run the existing test for `readLog` — it should still pass since reading is unchanged.

# Verification

```sh
pnpm install   # if needed
pnpm build
pnpm lint
pnpm test
```

All must pass. Visit `/wiki/log` mentally — confirm the rendered output will be a list of dated section headings rather than one paragraph blob.

# Notes

- Do NOT change `LogOperation` to be exported from `types.ts` unless you're already touching it — keep the diff small. Export from `wiki.ts` is fine.
- Do NOT add a frontmatter / structured JSON sidecar for the log. The whole point of the founding spec is that it's grep-friendly markdown.
- Touched files: 4 max (wiki.ts, wiki.test.ts, ingest.ts, query.ts) — log/page.tsx only if needed. Stay within budget.
