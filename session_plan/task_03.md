Title: Add sub-route error boundaries to key pages
Files: src/app/ingest/error.tsx, src/app/query/error.tsx, src/app/settings/error.tsx, src/app/wiki/[slug]/error.tsx
Issue: none

## Description

Only the root `src/app/error.tsx` exists. When a sub-page crashes, the entire app context is lost and the user gets a generic error page with no route-specific information. Add error boundaries to the 4 most critical sub-routes so failures are contained within their page section and users get contextual recovery options.

### What to create

Each error boundary is a small `"use client"` component (~30-40 lines) that:
- Shows a route-specific heading (e.g., "Ingest failed" not just "Something went wrong")
- Displays the error message
- Offers a "Try again" button (calls `reset()`)
- Offers a route-appropriate navigation link (e.g., "← Back to wiki" for wiki pages, "← Home" for ingest)

### 1. `src/app/ingest/error.tsx`
- Heading: "Ingest error"
- Context: "Something went wrong while ingesting content."
- Nav: Link to Home

### 2. `src/app/query/error.tsx`
- Heading: "Query error"
- Context: "Something went wrong while querying the wiki."
- Nav: Link to Home

### 3. `src/app/settings/error.tsx`
- Heading: "Settings error"
- Context: "Something went wrong loading settings."
- Nav: Link to Home

### 4. `src/app/wiki/[slug]/error.tsx`
- Heading: "Page error"
- Context: "Something went wrong loading this wiki page."
- Nav: Link to Wiki index (`/wiki`)

### Template pattern
All four follow the same template (adapt heading/context/link):

```tsx
"use client";

import Link from "next/link";

export default function IngestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">Ingest error</h1>
      <p className="mt-2 text-foreground/60">
        Something went wrong while ingesting content.
      </p>
      <p className="mt-4 rounded-lg border border-red-500/20 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error.message}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          ← Home
        </Link>
      </div>
    </main>
  );
}
```

## Verification
```
pnpm build && pnpm lint && pnpm test
```
These are new files only — no existing code modified. The build verifies they compile as valid error boundary components.
