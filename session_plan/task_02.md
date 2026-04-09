Title: Split wiki.ts — extract frontmatter and raw-source modules
Files: src/lib/frontmatter.ts, src/lib/raw.ts, src/lib/wiki.ts
Issue: none

## Description

`wiki.ts` is 1084 lines handling 7+ concerns. Every feature change touches it, and the
learnings file repeatedly warns about parallel write-path drift. This task extracts two
self-contained sections into their own modules, reducing wiki.ts by ~380 lines.

The key constraint: **re-export everything from wiki.ts** so no other file's imports break.
This is a pure refactor — zero functional changes. Existing imports like
`import { parseFrontmatter } from "@/lib/wiki"` continue to work.

### Extract `src/lib/frontmatter.ts` (~260 lines)

Move from wiki.ts (lines ~63-325):
- `interface Frontmatter`
- `interface ParsedPage`
- `parseFrontmatter()` (the full YAML parser)
- `serializeFrontmatter()` (the YAML serializer)
- All the internal constants/helpers used only by these functions (YAML line parsers, etc.)

The frontmatter module imports nothing from wiki.ts — it's pure string-in/object-out parsing.
It only needs the standard library.

In wiki.ts, replace the ~260 lines with:
```ts
// Re-export frontmatter utilities for backward compatibility
export { parseFrontmatter, serializeFrontmatter } from "./frontmatter";
export type { Frontmatter, ParsedPage } from "./frontmatter";
```

### Extract `src/lib/raw.ts` (~120 lines)

Move from wiki.ts (lines ~485-606):
- `saveRawSource()`
- `interface RawSource`
- `interface RawSourceWithContent`
- `listRawSources()`
- `readRawSource()`

These functions depend on `getRawDir()`, `validateSlug()`, and `ensureDirectories()` from
wiki.ts — import those from wiki.ts (they stay in wiki.ts since they're shared utilities).

In wiki.ts, replace the ~120 lines with:
```ts
// Re-export raw source utilities for backward compatibility
export { saveRawSource, listRawSources, readRawSource } from "./raw";
export type { RawSource, RawSourceWithContent } from "./raw";
```

### What stays in wiki.ts

After extraction, wiki.ts retains (~700 lines):
- Base directories (`getWikiDir`, `getRawDir`)
- Slug validation (`validateSlug`)
- Directory helpers (`ensureDirectories`)
- Wiki page I/O (`readWikiPage`, `readWikiPageWithFrontmatter`, `writeWikiPage`)
- Index management (`listWikiPages`, `updateIndex`)
- Log operations (`appendToLog`, `readLog`)
- Cross-referencing (`findRelatedPages`, `updateRelatedPages`)
- Lifecycle pipeline (`writeWikiPageWithSideEffects`, `deleteWikiPage`)

These remaining sections have deep interdependencies and are better split in a future session.

### Important constraints

- **No import changes in any other file.** All existing imports from `"@/lib/wiki"` or
  `"../wiki"` must continue to work via re-exports.
- **No functional changes.** All 248 tests must pass without modification.
- **TypeScript: export types with `export type`** for interfaces to satisfy isolatedModules.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All 248 existing tests must pass. No new tests needed — this is a pure refactor.
