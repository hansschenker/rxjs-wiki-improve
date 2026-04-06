Title: Security hardening — path traversal protection and empty slug guard
Files: src/lib/wiki.ts, src/lib/ingest.ts, src/lib/__tests__/wiki.test.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## Description

Two security/robustness issues from the assessment:

1. **No path traversal protection** (Gap #13): `readWikiPage` and `writeWikiPage` accept arbitrary slugs like `../../etc/passwd`. An attacker could read or write files outside the wiki directory via the API.
2. **`slugify("")` returns `""`** (Bug #4): This would create a `.md` file with no name. No guard in the ingest pipeline.

### Implementation Plan

1. **Add `validateSlug()` helper in `src/lib/wiki.ts`**:
   - Must be non-empty string after trimming
   - Must not contain `/`, `\`, `..`, or null bytes
   - Must match a safe pattern like `/^[a-z0-9][a-z0-9-]*$/` (lowercase alphanumeric + hyphens, can't start with hyphen)
   - Throws a descriptive error if invalid
   - Export it so tests and other modules can use it

2. **Call `validateSlug()` in `readWikiPage` and `writeWikiPage`**:
   - At the top of each function, validate the slug
   - `readWikiPage` should return `null` for invalid slugs (not throw — it already returns null for missing files)
   - `writeWikiPage` should throw on invalid slug (callers should handle)
   - Also validate in `saveRawSource` (uses `id` parameter as filename)

3. **Guard empty slug in `src/lib/ingest.ts`**:
   - After `const slug = slugify(title)`, check if slug is empty
   - If empty, throw an error: "Cannot ingest: title produces an empty slug"
   - This prevents creating a `.md` file with no name

4. **Add tests in `src/lib/__tests__/wiki.test.ts`**:
   - `validateSlug` rejects `""`, `"../"`, `"../../etc/passwd"`, `"foo/bar"`, `"foo\\bar"`, strings with null bytes
   - `validateSlug` accepts `"machine-learning"`, `"ai-2024"`, `"a"`
   - `readWikiPage` returns null for path-traversal slugs
   - `writeWikiPage` throws for path-traversal slugs

5. **Add test in `src/lib/__tests__/ingest.test.ts`**:
   - `ingest("", "some content")` throws with descriptive error
   - `ingest("!!!", "some content")` throws (slug would be empty after stripping special chars)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```
