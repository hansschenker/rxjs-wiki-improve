Title: Lightweight wiki list endpoint + fix GlobalSearch overhead
Files: src/app/api/wiki/route.ts, src/components/GlobalSearch.tsx, src/lib/__tests__/smoke.test.ts
Issue: none

## Description

`GlobalSearch` currently fetches `/api/wiki/graph` to get page names for title search.
That endpoint reads every wiki page from disk and builds a full link graph — far heavier
than necessary when all we need is `[{ id, label }]` pairs. The assessment flagged this
as a low-severity inefficiency.

## Implementation

1. In `src/app/api/wiki/route.ts`:
   - Add a `GET` handler that calls `listWikiPages()` and returns the entries as JSON:
     ```ts
     export async function GET() {
       const entries = await listWikiPages();
       return NextResponse.json({ pages: entries });
     }
     ```
   - Import `listWikiPages` from `@/lib/wiki`

2. In `src/components/GlobalSearch.tsx`:
   - Change `fetchPages` to call `GET /api/wiki` instead of `/api/wiki/graph`
   - Map the response's `pages` array (which has `{ slug, title, summary }`) to the
     `SearchNode` format: `{ id: slug, label: title }`
   - This is a ~3-line change in the fetch callback

3. In `src/lib/__tests__/smoke.test.ts`:
   - Add a smoke test that verifies the GET /api/wiki shape if there's a pattern for it,
     or skip if smoke tests don't cover API routes (check existing patterns first)

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```
