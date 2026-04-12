Title: Add "missing-concept-page" lint check — detect important concepts lacking their own wiki page
Files: src/lib/types.ts, src/lib/lint.ts, src/lib/__tests__/lint.test.ts
Issue: none

## Description

The founding vision (`llm-wiki.md`) explicitly calls out this lint check: "important concepts mentioned but lacking their own page." This is the most powerful feature for a compounding wiki — the system itself identifies what knowledge it's missing. Current lint handles structural issues (orphan pages, stale index, empty pages, missing cross-refs, contradictions) but doesn't detect *conceptual* gaps.

### Implementation

**1. Add `"missing-concept-page"` to the `LintIssue` type union** in `src/lib/types.ts`:

```ts
type: "orphan-page" | "stale-index" | "missing-crossref" | "empty-page" | "contradiction" | "missing-concept-page";
```

**2. Add `checkMissingConceptPages()` in `src/lib/lint.ts`:**

This check uses the LLM to identify important concepts mentioned across wiki pages that don't have their own page yet. Strategy:

- If no LLM key is configured, skip with an info-level message (same pattern as contradiction check)
- Gather all existing page titles/slugs into a set
- Concatenate a representative sample of page contents (respect token limits — use the first ~500 chars of each page, up to ~20 pages)
- Send a single LLM call with a system prompt like:
  ```
  You are a wiki knowledge gap detector. Given the following wiki pages and the list of existing page titles, identify important concepts, entities, or topics that are mentioned multiple times across pages but do NOT have their own dedicated wiki page yet.

  Return a JSON array of objects: [{"concept": "Name of Concept", "mentioned_in": ["slug-a", "slug-b"], "reason": "Brief explanation of why this deserves its own page"}]

  Only include concepts that are genuinely important and mentioned in at least 2 different pages. Respond ONLY with the JSON array.
  ```
- Parse the response (same defensive JSON parsing pattern as `parseContradictionResponse`)
- Emit one `LintIssue` per concept with type `"missing-concept-page"`, severity `"info"`, and the first mentioning slug as `slug`

**3. Wire into `lint()` function:**

Call `checkMissingConceptPages(diskSlugs)` after the contradiction check (it's another LLM-dependent check). Add results to the issues array.

**4. Add tests in `src/lib/__tests__/lint.test.ts`:**

- Test that `checkMissingConceptPages` is skipped (returns info message) when no LLM key
- Test the JSON response parser for valid input, malformed input, empty array
- Test that the lint result includes `"missing-concept-page"` type issues when the check succeeds (mock `callLLM`)

**5. Load SCHEMA.md conventions into the system prompt** (same pattern as contradiction detection).

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Ensure all existing 485 tests still pass plus the new ones.
