Title: Fix frontmatter round-trip bug and HTML entity decoding
Files: src/lib/frontmatter.ts, src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts, src/lib/__tests__/wiki.test.ts
Issue: none

## Problem 1: Frontmatter round-trip bug

The serializer in `serializeFrontmatter` escapes double quotes as `\"` when quoting scalar values and array elements (lines 238, 252). But `unquoteScalar` in `parseFrontmatter` only strips the outer quotes — it doesn't unescape `\"` back to `"`. This means:

- Write: `title: "Say \"hello\" world"` 
- Read back: `Say \"hello\" world` (backslashes preserved, wrong)
- Expected: `Say "hello" world`

### Fix

In `unquoteScalar()` (line 32), after stripping outer double quotes, unescape `\"` → `"`. Only do this for double-quoted strings (single-quoted YAML strings don't use backslash escaping):

```ts
if (first === '"' && last === '"') {
  return trimmed.slice(1, -1).replace(/\\"/g, '"');
}
```

Also in `splitInlineArray`, after extracting quoted array elements, the same unescaping needs to happen — but that's handled by the subsequent `unquoteScalar` call on each element, so the fix in `unquoteScalar` covers both paths.

### Tests

Add test cases to the existing frontmatter tests in `wiki.test.ts`:
- Round-trip a title containing double quotes
- Round-trip an array element containing double quotes
- Verify single-quoted values don't get backslash-unescaped

## Problem 2: Incomplete HTML entity decoding

`stripHtml()` in `ingest.ts` (line 67) only handles 6 entities: `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&nbsp;`. Real HTML contains many more:
- Numeric: `&#8212;` (em dash), `&#x2014;` (hex em dash)
- Named: `&mdash;`, `&hellip;`, `&rsquo;`, `&ldquo;`, etc.

### Fix

Add a general numeric entity decoder after the specific replacements:
```ts
// Decode numeric entities: &#123; and &#x1F; 
.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
```

For named entities, add the most common HTML5 named entities (`&mdash;`, `&ndash;`, `&hellip;`, `&rsquo;`, `&lsquo;`, `&rdquo;`, `&ldquo;`, `&trade;`, `&copy;`, `&reg;`, `&bull;`, `&middot;`).

### Tests

Add test cases to `ingest.test.ts`:
- Numeric decimal entities decode correctly
- Numeric hex entities decode correctly  
- Common named entities decode correctly
- Existing entity tests still pass

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```
