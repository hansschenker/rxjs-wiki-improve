Title: Fix graph regex stale-state bug + lint empty-slug link bug + saved-answer cross-refs
Files: src/app/api/wiki/graph/route.ts, src/app/lint/page.tsx, src/lib/query.ts, src/lib/__tests__/query.test.ts, src/lib/__tests__/wiki.test.ts (or a new test)
Issue: none

# Background

Three small, real bugs found in code review. Fixing them all in one task because each is
~5 minutes and they're independently verifiable.

## Bug 1: Stale-regex state in `/api/wiki/graph`

`src/app/api/wiki/graph/route.ts:25` declares a `/g`-flag regex outside the per-page loop:

```ts
const linkRe = /\[([^\]]*)\]\(([^)]+)\.md\)/g;

for (const page of pages) {
  const wp = await readWikiPage(page.slug);
  if (!wp) continue;
  let match;
  while ((match = linkRe.exec(wp.content)) !== null) {
    ...
  }
}
```

Because `g`-flag regexes carry `lastIndex` state across `exec()` calls, after the inner loop
exits with `match === null`, `linkRe.lastIndex` is `0` again — that part is OK. BUT if any
inner loop terminates early (it can't here, but it's fragile), or if the regex is matched
against shorter content where `lastIndex` outlives the data, edges get silently dropped.
Even if today's code path is technically safe, it's a known footgun. Fix it the safe way.

**Fix:** move the regex declaration *inside* the `for` loop, or call `linkRe.lastIndex = 0`
at the top of each iteration. Inside the loop is cleaner.

## Bug 2: Empty-slug link in `/lint`

`src/app/lint/page.tsx:141-146` always renders:

```tsx
<Link href={`/wiki/${issue.slug}`}>{issue.slug}</Link>
```

But `lint.ts` `checkContradictions()` produces an issue with `slug: ""` when no LLM key is
configured (the "no LLM key" sentinel). That renders as `<Link href="/wiki/">` and the badge
displays an empty string — a broken link with an empty label.

**Fix:** conditionally render the slug pill. If `issue.slug` is empty (or matches some
sentinel like `"__system__"`), render either nothing or a non-link badge labeled `system`
(your call — `system` is friendlier). Keep the same surrounding flex layout so spacing is
unaffected.

While you're there, double-check `key={...}` in the surrounding `<li>` won't collide if two
issues have empty slugs. Use the array index already in scope (`i`) as a tiebreaker — already
done at line 130 (`${issue.slug}-${issue.type}-${i}`), so no change needed.

## Bug 3: `saveAnswerToWiki` doesn't run cross-references

`src/lib/query.ts` `saveAnswerToWiki()` (around line 280-338) writes a wiki page, updates the
index, appends to log — but skips the cross-reference pass that `ingest()` does. The result
is that saved query answers are *orphaned* from related pages even when they obviously belong
in a cluster. This contradicts the founding vision that the wiki is a "compounding artifact"
where every new page strengthens the cross-reference graph.

**Fix:** after the index update and before the log append, call the same cross-ref helpers
that `ingest()` uses:

```ts
import { findRelatedPages, updateRelatedPages } from "./ingest";

// ... after updateIndex(entries):
const refreshedEntries = await listWikiPages();
const relatedSlugs = await findRelatedPages(slug, content, refreshedEntries);
const updatedSlugs = await updateRelatedPages(slug, title, relatedSlugs);
```

**Important:** `findRelatedPages` and `updateRelatedPages` must be exported from `ingest.ts`
if they aren't already. Check first — if they're already exported, just import. If not, add
the `export` keyword to both function declarations in `ingest.ts`. (Look at the top of
`src/lib/ingest.ts` — it lists exported functions in the assessment.)

Update the log line from this task's perspective to include the count, similar to ingest:

```ts
await appendToLog("save", title, `query answer saved as ${slug} · linked ${updatedSlugs.length} related page(s)`);
```

(This depends on task_01 having already updated the `appendToLog` signature. If task_01 has
not landed yet when you start this task, leave the log call alone and only do the cross-ref
pass + the two other bug fixes.)

The `saveAnswerToWiki` return value should probably also include `relatedSlugs` for the
caller — but only if the caller uses it. Check `src/app/api/query/save/route.ts` first; if
the caller doesn't read it, don't change the return shape.

# Tests to add or update

## In `src/lib/__tests__/query.test.ts`

Add a test for `saveAnswerToWiki`:
- Set up a wiki with two existing pages (e.g. `react.md` and `nextjs.md`) that mention
  some entity (e.g. "JavaScript framework").
- Call `saveAnswerToWiki` with a title/answer that strongly mentions both.
- After the call, read both `react.md` and `nextjs.md` and assert that at least one of them
  now contains a link back to the saved answer's slug. (This mirrors the cross-ref test that
  presumably already exists for `ingest()`. Look at `src/lib/__tests__/ingest.test.ts` for the
  pattern and copy it.)

## In `src/lib/__tests__/wiki.test.ts` or a new graph-specific test

The graph route is in `src/app/api/wiki/graph/`. You can either:
- (a) Test the route handler directly by importing and invoking `GET()`. This works if there
  are no Next-runtime dependencies — try it, fall back to (b) if it's awkward.
- (b) Skip the route test and just trust the regex-fix is correct by writing a unit test for a
  small helper. Simpler: add a comment-only fix and rely on the existing graph test (if any)
  to cover regression. **Search for existing graph tests first** with `grep -r "graph" src/lib/__tests__`. If there is one, extend it with a multi-page scenario that would
  have caught the stale-`lastIndex` bug. If there isn't one, write a minimal one in
  `src/lib/__tests__/wiki.test.ts` that mocks `listWikiPages`/`readWikiPage` and calls `GET()`.

The lint empty-slug bug is UI-only — no test required, just visually confirm.

# Verification

```sh
pnpm install   # if needed
pnpm build
pnpm lint
pnpm test
```

All four must pass. Specifically:
- Test count should go up by at least 1 (the new `saveAnswerToWiki` cross-ref test).
- No new lint errors.
- Build still produces all 15 routes.

# Constraints

- Files touched: 5 max.
- Bugs 1 and 2 are independent of task_01 and task_02 — apply them even if those tasks
  haven't landed.
- Bug 3 is mostly independent of task_01 (only the log line needs the new signature). If
  task_01 hasn't landed, keep the old `appendToLog(string)` call shape and just add the
  cross-ref pass.
- Do not refactor unrelated code in `query.ts` or `lint/page.tsx`. Focused fix only.
