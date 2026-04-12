Title: Full-text content search in GlobalSearch
Files: src/app/api/wiki/search/route.ts (new), src/lib/wiki.ts, src/components/GlobalSearch.tsx
Issue: none

## Problem

GlobalSearch only matches page titles. Users expect a search bar to search page content too. This is gap #1 from the assessment — the highest-impact UX gap. The founding vision's index.md-first approach works for structured browsing, but a search bar that can't find content feels broken.

Also fixes the stale-cache issue where `fetchedRef` prevents pages added during the session from appearing (assessment friction item).

## Implementation

### 1. Add `searchWikiContent()` to `src/lib/wiki.ts`

Add a function that searches wiki page content for a query string:

```ts
export async function searchWikiContent(query: string, maxResults = 10): Promise<IndexEntry[]> {
  // Read all wiki page files from the wiki directory
  // For each .md file (excluding index.md, log.md):
  //   - Read the file content
  //   - Check if the query terms appear in the content (case-insensitive)
  //   - Score by number of term matches (simple term frequency)
  // Return top N results as IndexEntry objects
}
```

Keep it simple — no BM25 here, just case-insensitive substring matching across page content. This is for the real-time search bar, not the query engine.

Implementation approach:
- Split query into words (lowercase, filter empty)
- For each wiki .md file, read content, check how many query words appear
- Score = count of matching words (OR semantics, not AND)
- Sort by score descending, return top `maxResults`
- Return entries with slug, title (from frontmatter or first heading), and a snippet showing the match context

### 2. Create `src/app/api/wiki/search/route.ts`

```
GET /api/wiki/search?q=search+terms
```

Response:
```json
{
  "results": [
    { "slug": "...", "title": "...", "summary": "...", "snippet": "...match context..." }
  ]
}
```

- Validate `q` param exists and is non-empty
- Call `searchWikiContent(q)`
- Return results

### 3. Update `src/components/GlobalSearch.tsx`

Currently fetches page list once and filters by title client-side. Change to:

- Keep the current title-matching as instant results (no latency)
- When the user types 3+ characters, also fire a debounced (300ms) request to `/api/wiki/search?q=...`
- Merge results: title matches first, then content matches (deduplicated by slug)
- Show content matches with a snippet line below the title
- Remove the `fetchedRef` guard so the page list refreshes on each open (or at least re-fetches if stale)

The search results UI should distinguish between title matches and content matches visually (e.g., content matches show a small snippet in muted text).

## Verification

```bash
pnpm build && pnpm lint && pnpm test
```

Manually verify: the GlobalSearch dropdown should show content matches when typing 3+ characters.
