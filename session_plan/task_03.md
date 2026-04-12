Title: Query history — persist and display past queries
Files: src/lib/query-history.ts (new), src/app/api/query/history/route.ts (new), src/app/query/page.tsx, src/lib/__tests__/query-history.test.ts (new)
Issue: none

## Problem

Queries are ephemeral — the question and answer vanish when the user navigates away. The founding vision emphasizes "explorations compound in the knowledge base" but only saved answers persist; the questions themselves and unsaved answers are lost. This is assessment gap #4.

Users should be able to see what they've asked before, revisit answers, and build on past explorations.

## Implementation

### 1. Create `src/lib/query-history.ts`

A simple filesystem-backed query history store:

```ts
interface QueryHistoryEntry {
  id: string;           // nanoid or timestamp-based
  question: string;
  answer: string;
  sources: string[];    // cited page slugs
  timestamp: string;    // ISO 8601
  savedAs?: string;     // slug if the answer was saved to wiki
}

// Store as a JSON file at wiki/query-history.json
// (inside wiki dir so it's part of the wiki artifact)

export async function appendQuery(entry: Omit<QueryHistoryEntry, "id">): Promise<QueryHistoryEntry>
export async function listQueries(limit?: number): Promise<QueryHistoryEntry[]>  // most recent first
export async function markSaved(id: string, slug: string): Promise<void>
```

- `appendQuery`: Read file, append entry with generated id, write back. Use file locking via `withFileLock`.
- `listQueries`: Read file, return reversed (most recent first), optionally limited.
- `markSaved`: Update the `savedAs` field on a specific entry.
- Max history: keep last 200 entries, trim oldest on append.

### 2. Create `src/app/api/query/history/route.ts`

```
GET /api/query/history?limit=20
```

Returns `{ entries: QueryHistoryEntry[] }`.

Simple GET route, no auth needed (local-first app).

### 3. Update `src/app/query/page.tsx`

Add a "Recent queries" sidebar/section below the query form:

- On mount, fetch `/api/query/history?limit=20`
- Display as a list: question text (truncated), timestamp (relative like "2 hours ago"), source count
- Clicking a history entry populates the question field and shows the cached answer (no re-query)
- When a query completes successfully, auto-save to history via a POST to the stream/query endpoint (or call history API separately)
- When "Save to wiki" succeeds, update the history entry's `savedAs` field

For saving to history: after a successful streaming query completes, POST to a small save-history endpoint, or better yet, have the existing `/api/query/stream` route append to history as a side effect after streaming completes.

Actually, cleaner approach: have the query page POST to `/api/query/history` after streaming finishes on the client side. Add a POST handler:

```
POST /api/query/history
Body: { question, answer, sources }
```

### 4. Create `src/lib/__tests__/query-history.test.ts`

- Test append and list (most recent first)
- Test limit parameter
- Test markSaved updates entry
- Test max 200 cap trims oldest
- Test empty file / missing file gracefully handled

## Verification

```bash
pnpm build && pnpm lint && pnpm test
```
