Title: Parallelize lint LLM checks and extract shared JSON response parser
Files: src/lib/lint.ts, src/lib/__tests__/lint.test.ts
Issue: none

## Description

Two code quality improvements in lint.ts identified by the assessment.

### 1. Parallelize contradiction + missing-concept LLM checks

Currently in `lint()` (lines 512-515):
```ts
const contradictions = await checkContradictions(diskSlugs);
const missingConcepts = await checkMissingConceptPages(diskSlugs);
```

These are independent LLM-calling checks that run sequentially. They both only read wiki pages (no writes), so they can safely run in parallel:

```ts
const [contradictions, missingConcepts] = await Promise.all([
  checkContradictions(diskSlugs),
  checkMissingConceptPages(diskSlugs),
]);
```

This halves the wall-clock time for lint when both checks are active.

### 2. Extract shared JSON response parser

`parseContradictionResponse` (lines 235-266) and `parseMissingConceptResponse` (lines 375-409) share identical boilerplate:
1. Trim the response
2. Strip markdown code fences
3. JSON.parse
4. Validate it's an array
5. Validate each item against a schema
6. Return typed results or empty array on failure

Extract a generic `parseLLMJsonArray<T>(response: string, validateItem: (item: unknown) => T | null): T[]` helper that both functions delegate to. This eliminates the duplicated fence-stripping and try/catch logic.

The validation callbacks remain specific to each parser (contradiction validates `pages` + `description`, concept validates `concept` + `mentioned_in` + `reason`).

### Testing

- Existing lint tests should continue to pass unchanged (the behavior is identical)
- Existing tests that import `parseContradictionResponse` or `parseMissingConceptResponse` should still work
- If there are tests for the parsers, they validate the extraction works correctly
- Run `pnpm build && pnpm lint && pnpm test` to verify
