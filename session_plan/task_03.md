Title: Load SCHEMA.md page conventions into the ingest system prompt at runtime
Files: src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts

Issue: none

## Why this task

Gap #3 from the assessment: `SCHEMA.md` exists as a parallel document that has to be kept in sync with hardcoded prompts by hand. Each operation (ingest, query, lint) has its own in-file `SYSTEM_PROMPT` string that doesn't reference the schema. The founding vision in `llm-wiki.md` explicitly calls out **"co-evolve the schema"** as a core pattern — when you change the schema doc, the LLM's behavior should change. Right now you can edit SCHEMA.md all day and the ingest prompt will not move an inch.

This task is the **smallest possible step** in that direction: load a specific, named slice of SCHEMA.md at runtime and splice it into the ingest system prompt. One operation. One file of prompt. One section of SCHEMA. If this pattern works it can be extended to query and lint in future sessions.

**Previous sessions' warning to heed:** learnings.md says "derive metadata from source, not from LLM output." This task is derivation-from-source in the prompt dimension — letting SCHEMA.md (the deterministic source of conventions) shape the prompt instead of hand-copied prose.

## What to change

### 1. `src/lib/ingest.ts`

At the top of the file (or in a helper section below the imports), add:

```ts
import { readFile } from "fs/promises";
import path from "path";
```

(Check if `path` and `fs/promises` are already imported — they probably are via `wiki.ts`'s re-exports or direct usage. Don't duplicate.)

Add an async helper:

```ts
/**
 * Read the "Page conventions" section out of SCHEMA.md at repo root so the
 * ingest prompt can include it verbatim. This makes SCHEMA.md the source of
 * truth — change the doc, change ingest behavior on the next call.
 *
 * Extracts from the `## Page conventions` heading up to (but not including)
 * the next `## ` heading. Returns empty string if SCHEMA.md is missing or
 * the section can't be found, so ingest degrades gracefully rather than
 * crashing on a fresh clone.
 */
async function loadPageConventions(): Promise<string> {
  try {
    const schemaPath = path.join(process.cwd(), "SCHEMA.md");
    const schema = await readFile(schemaPath, "utf-8");
    const startIdx = schema.indexOf("## Page conventions");
    if (startIdx === -1) return "";
    const afterStart = schema.slice(startIdx);
    // Find the next top-level section heading after the Page conventions one
    const nextHeadingMatch = afterStart.slice("## Page conventions".length).match(/\n## /);
    const section = nextHeadingMatch
      ? afterStart.slice(0, "## Page conventions".length + nextHeadingMatch.index!)
      : afterStart;
    return section.trim();
  } catch {
    return "";
  }
}
```

Then modify the existing `SYSTEM_PROMPT` constant — it currently lives as a `const` at module scope. Rename it to `INGEST_SYSTEM_PROMPT_BASE` (keep the existing text) and add a new async function:

```ts
async function buildIngestSystemPrompt(): Promise<string> {
  const conventions = await loadPageConventions();
  if (conventions === "") return INGEST_SYSTEM_PROMPT_BASE;
  return `${INGEST_SYSTEM_PROMPT_BASE}

The wiki you are editing follows these conventions (from SCHEMA.md):

${conventions}

Follow these conventions when generating the page.`;
}
```

In `ingest()`, replace the line:
```ts
wikiContent = await callLLM(SYSTEM_PROMPT, content);
```
with:
```ts
wikiContent = await callLLM(await buildIngestSystemPrompt(), content);
```

Export `loadPageConventions` and `buildIngestSystemPrompt` so tests can call them directly (or don't export and test via the observable side-effect of SYSTEM_PROMPT content — exporting is cleaner).

### 2. Tests in `src/lib/__tests__/ingest.test.ts`

Add a new `describe("schema-aware ingest prompt", ...)` block with:

- **`loadPageConventions` reads the real SCHEMA.md** — assert the returned string starts with `## Page conventions` and contains a recognizable substring like `"kebab-case slugs"` (which is in the real SCHEMA.md today). This is an integration check that the slice extraction is actually grabbing the right region of the file. If SCHEMA.md ever gets restructured such that the substring changes, this test failing is a feature, not a bug — it's the co-evolution alarm.
- **`loadPageConventions` stops at the next heading** — assert the returned string does NOT contain substrings from a LATER section of SCHEMA.md (e.g. `## Operations` or whatever the next top-level heading is — check the current file and pick something that is definitely in the next section). This proves the end-boundary regex is working.
- **`buildIngestSystemPrompt` composes base + conventions** — mock/stub nothing, just call it and assert the returned string contains BOTH the base prompt marker (`"You are a wiki editor"` or similar — check the current const) AND the conventions marker. This test is the contract that the schema is actually making it into the prompt.
- **Graceful degradation** — if `SCHEMA.md` doesn't exist, `buildIngestSystemPrompt` must return the base prompt unchanged. Simulate this by pointing `loadPageConventions` at a nonexistent file (or, more pragmatically: test that `loadPageConventions` returns `""` when given a made-up path, and trust the composition function's early-return). If a full mock is awkward, just test that the base prompt string is a substring of the composed prompt — that alone proves graceful composition.

Do **not** modify any existing ingest tests — they should still pass because the prompt text only gets longer; nothing about the returned wiki page shape changes.

## Non-goals

- Do NOT touch query.ts or lint.ts prompts. This task is ingest-only so the pattern can be proved on one surface before spreading.
- Do NOT cache the SCHEMA.md read across calls. Reading a 5KB file per ingest is fine. Caching introduces stale-prompt bugs during live SCHEMA.md edits, which is exactly the behavior we want to avoid.
- Do NOT restructure SCHEMA.md. Work with the current section structure. If the "Page conventions" heading ever moves, that's a separate task.
- Do NOT change the ingest return shape or any other public API.
- Do NOT add new dependencies.

## Verification

```
pnpm build && pnpm lint && pnpm test
```

All existing tests must still pass. The new schema-aware prompt tests must pass. If an existing test was asserting the exact content of `SYSTEM_PROMPT` (grep for it), update it to assert against `INGEST_SYSTEM_PROMPT_BASE` instead.

Manual spot-check after build: grep the built output or the source for `"Page conventions"` and confirm it's referenced in the ingest path.
