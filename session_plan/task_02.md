Title: Fix findBacklinks regex escape and replace bare catch blocks in wiki.ts and query.ts
Files: src/lib/wiki.ts, src/lib/query.ts, src/lib/__tests__/wiki.test.ts, src/lib/__tests__/query.test.ts
Issue: none

## Bug: Unescaped slug in findBacklinks regex

In `wiki.ts` line ~515, `findBacklinks` constructs a regex from user-provided slug without escaping:
```ts
const linkPattern = new RegExp(`\\]\\(${targetSlug}\\.md\\)`);
```

If a slug contains regex metacharacters (e.g., `c++`, `node.js`, `some(thing)`), this creates an invalid or incorrect regex. Fix: escape the slug before interpolation.

Add a helper at the top of `wiki.ts`:
```ts
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

Then use it:
```ts
const linkPattern = new RegExp(`\\]\\(${escapeRegExp(targetSlug)}\\.md\\)`);
```

**Add tests** in `wiki.test.ts`:
- `findBacklinks` with a slug containing a dot (e.g., `node.js`) — verify it doesn't match `nodejs.md`
- `findBacklinks` with a slug containing parens — verify no regex error

## Replace bare catch blocks in wiki.ts and query.ts

There are 7 bare `catch {}` blocks in `wiki.ts` and 3 in `query.ts`. These silently swallow errors, making debugging impossible.

**Approach**: Add `console.warn` with context to each catch block. Don't change the control flow — these catches exist because the callers expect graceful fallbacks (return `null`, return `[]`, etc.). Just make failures visible.

For each bare `catch {}`, change to `catch (err) { console.warn('[wiki] <operation> failed:', err); }` or similar.

In `wiki.ts` (7 catches around lines 120, 143, 209, 388, 445, 563, 584):
- Read each to understand what operation is being caught
- Add a descriptive console.warn with the module name and operation

In `query.ts` (3 catches around lines 120, 292, 330):
- Same approach

**Do NOT change the return values or control flow.** The catch blocks intentionally return fallback values. We're only adding visibility.

**Test impact**: Tests that mock fs operations to throw should still pass since the behavior (fallback return) is unchanged. Check that no test asserts `console.warn` was NOT called — if so, update accordingly.

## Verification
```sh
pnpm build && pnpm lint && pnpm test
```
