Title: Wire SCHEMA.md into lint and query system prompts
Files: src/lib/lint.ts, src/lib/query.ts, src/lib/ingest.ts (export loadPageConventions), src/lib/__tests__/lint.test.ts, src/lib/__tests__/query.test.ts
Issue: none

## Description

The learnings.md explicitly flags this as the next step: "lint and query system prompts are the next obvious candidates" for runtime SCHEMA.md loading. Currently only ingest loads SCHEMA.md at runtime via `loadPageConventions()`. The lint and query prompts use hardcoded instructions, creating a parallel-write-path that will drift.

### Steps

1. **Export `loadPageConventions` from `src/lib/ingest.ts`** — it's already exported, but extract it into a shared location if needed, or just import from ingest.ts into the other modules. The function is already exported so importing it directly is fine.

2. **Modify `src/lib/query.ts`** — In the `query()` function, load SCHEMA.md conventions before building the system prompt. Append a conventions section to `SYSTEM_PROMPT_TEMPLATE` interpolation. Specifically:
   - Import `loadPageConventions` from `./ingest`
   - Before the `callLLM()` call in `query()`, call `await loadPageConventions()`
   - If conventions are non-empty, append them to the system prompt after the template substitution
   - Keep the same pattern as ingest: "The wiki you are working with follows these conventions (from SCHEMA.md):\n\n{conventions}"

3. **Modify `src/lib/lint.ts`** — Load SCHEMA.md conventions into the contradiction detection system prompt. Specifically:
   - Import `loadPageConventions` from `./ingest`
   - In `checkContradictions()`, before the `callLLM()` call, load conventions
   - Append them to `CONTRADICTION_SYSTEM_PROMPT` if non-empty
   - Also load conventions into the `INDEX_SELECTION_PROMPT` in query.ts if it uses LLM

4. **Add/update tests** — Add at least 2 tests:
   - A test that `loadPageConventions` is callable from outside ingest.ts
   - A test that verifies query and lint prompts can incorporate SCHEMA.md content (mock the function if needed, or use the test SCHEMA fixture)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All 243+ tests must pass. The build must succeed. No new lint errors.
