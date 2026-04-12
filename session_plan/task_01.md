Title: Fix GlobalSearch performance — deduplicate fetchPages calls
Files: src/components/GlobalSearch.tsx
Issue: none

## Problem

`GlobalSearch.tsx` calls `fetchPages()` on every keystroke in the `onChange` handler (line ~245), plus on `onFocus`, on mobile expand click, and on keyboard shortcut activation. Each call fires a fresh `GET /api/wiki` network request. For a wiki with many pages, this means N requests per N characters typed, with no caching.

The content search already has a proper debounce (`CONTENT_SEARCH_DEBOUNCE_MS = 300`), but `fetchPages()` for title matching has none.

## Fix

1. **Cache pages on open, don't refetch on keystroke.** The page list (titles + slugs) rarely changes during a search session. Fetch it once when the search dropdown opens (on focus/expand/keyboard shortcut), and reuse the cached list for title filtering.

2. **Remove `fetchPages()` from `onChange`.** Title filtering should operate on the already-fetched `pages` state — it's purely client-side string matching against the cached page list.

3. **Keep the existing `searchContent` debounce** for server-side full-text search — that's already well-handled.

4. **Add a staleness guard** — if the page list was fetched less than 5 seconds ago, skip refetching on re-focus/re-open. This prevents rapid open/close/open cycles from hammering the server.

Specific changes in `GlobalSearch.tsx`:
- Add a `lastFetchRef = useRef<number>(0)` to track when pages were last fetched
- In `fetchPages()`, skip the fetch if `Date.now() - lastFetchRef.current < 5000` and `pages.length > 0`
- Remove `fetchPages()` from the `onChange` handler (line ~245)
- Keep `fetchPages()` on `onFocus` and keyboard shortcuts (guarded by staleness check)

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

The component has no unit tests (it's a UI component), so verify by reading the code and confirming no `fetchPages()` call remains in onChange, and that the staleness guard is present.
