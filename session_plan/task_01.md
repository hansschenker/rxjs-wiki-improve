Title: Ingest UI — add a form to submit content into the wiki
Files: src/app/ingest/page.tsx, src/app/page.tsx, src/app/wiki/page.tsx
Issue: #1 (completing the ingest workflow — currently API-only)

## Description

The ingest API (`POST /api/ingest`) works, but there's no web form. A user visiting the app has zero way to add content. This is the single biggest usability gap — fix it.

### Create `src/app/ingest/page.tsx`

Build a client component (`"use client"`) with:

1. **Title field** — `<input type="text">` for the document title
2. **Content field** — `<textarea>` for pasting the source content (large, ~12 rows)
3. **Submit button** — POSTs to `/api/ingest` with JSON `{ title, content }`
4. **Loading state** — disable button + show "Processing..." while request is in flight
5. **Success state** — show the result: link to the newly created wiki page (`/wiki/{slug}`)
6. **Error state** — show error message from API

Keep it simple — no URL fetching yet, just title + text paste. Use Tailwind for styling consistent with the existing pages (same max-w-3xl, px-6, py-12 pattern).

The form should call `fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) })`.

After successful ingest, show:
- "✓ Ingested as wiki page" message
- Link to the created page: `/wiki/${result.wikiPages[0]}`
- A "Back to wiki" link
- An "Ingest another" button to reset the form

### Update `src/app/page.tsx`

Add an "Ingest Content" link/button alongside the existing "Browse Wiki →" button on the landing page. Something like:

```
<Link href="/ingest">Ingest Content</Link>
<Link href="/wiki">Browse Wiki →</Link>
```

Style both as prominent buttons side-by-side.

### Update `src/app/wiki/page.tsx`

Add an "Ingest" link in the header bar (next to the "← Home" link) so users can easily navigate to the ingest form from the wiki index.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All must pass. The page should be a valid Next.js App Router page. Since it's a client component, ensure the `"use client"` directive is at the top.
