Title: Query operation — ask questions against the wiki
Files: src/lib/query.ts, src/app/api/query/route.ts, src/app/query/page.tsx, src/lib/types.ts
Issue: none

## Description

The **query** operation is one of the three core operations in the founding vision (ingest, query, lint). Users should be able to ask questions and get cited answers drawn from their wiki pages. This is the primary way users interact with a growing wiki.

### Add `QueryResult` type to `src/lib/types.ts`

```ts
/** Result from a query against the wiki. */
export interface QueryResult {
  answer: string;       // Markdown-formatted answer with citations
  sources: string[];    // slugs of wiki pages used as sources
}
```

### Create `src/lib/query.ts`

The query pipeline:

1. **Load the index** — call `listWikiPages()` to get all entries
2. **Select relevant pages** — for now, load ALL wiki pages (this is fine for small wikis; add smarter selection later). Read each page's content using `readWikiPage()`.
3. **Build context** — concatenate page contents into a context string, with clear page boundaries:
   ```
   === Page: {title} (slug: {slug}) ===
   {content}
   ```
4. **Call LLM** — send the context + user question to Claude with a system prompt that instructs it to:
   - Answer based ONLY on the provided wiki pages
   - Cite sources using `[Page Title](slug.md)` format
   - If the wiki doesn't contain enough information, say so
   - Format the answer in markdown
5. **Extract sources** — parse the LLM response to find which slugs were cited (scan for `](*.md)` patterns)
6. **Return** `{ answer, sources }`

**Fallback when no API key:** Return a helpful message listing what wiki pages exist and suggesting the user set `ANTHROPIC_API_KEY`.

System prompt for query:
```
You are a wiki assistant. Answer the user's question using ONLY the wiki pages provided below.

Rules:
- Base your answer strictly on the wiki content provided
- Cite your sources using markdown links: [Page Title](slug.md)
- If the wiki doesn't contain enough information to answer, say so clearly
- Format your answer in markdown

Wiki pages:
{context}
```

### Create `src/app/api/query/route.ts`

POST handler accepting `{ question: string }`:
- Validate that question is a non-empty string
- Call the query function
- Return `{ answer, sources }` as JSON
- Handle errors with appropriate status codes

### Create `src/app/query/page.tsx`

Client component (`"use client"`) with:

1. **Question input** — a text input or textarea for the question
2. **Ask button** — POSTs to `/api/query`
3. **Loading state** — show "Thinking..." while waiting
4. **Answer display** — render the markdown answer using the MarkdownRenderer component (from task_02). If task_02 hasn't been done yet, fall back to `whitespace-pre-wrap` display.
5. **Source links** — show cited wiki pages as clickable links below the answer
6. **Empty wiki state** — if there are no wiki pages, show a message directing user to ingest content first

Also add navigation links to the query page from:
- The landing page (`src/app/page.tsx`) — add "Ask a Question" button alongside existing buttons. BUT only if task_01 already modified page.tsx; if not, just add the query link.

NOTE: Since task_01 may or may not have run first, be defensive. Check what page.tsx looks like before modifying it. Add the query link without breaking what's already there.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All must pass. The query page should be a valid client component. The API route should handle missing API keys gracefully (return a helpful error, not crash).
