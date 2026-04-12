Title: Deduplicate 5 near-identical error boundary components into one shared component
Files: src/components/ErrorBoundary.tsx, src/app/ingest/error.tsx, src/app/query/error.tsx, src/app/settings/error.tsx, src/app/wiki/[slug]/error.tsx
Issue: none

## Description

There are 4 page-level error boundaries (`ingest/error.tsx`, `query/error.tsx`, `settings/error.tsx`, `wiki/[slug]/error.tsx`) that are nearly identical — they differ only in the title, description text, and back-link destination. This is ~150 lines of duplicated code.

### Implementation

**1. Create `src/components/ErrorBoundary.tsx`:**

A shared "use client" component that accepts props:

```tsx
interface PageErrorProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  error: Error & { digest?: string };
  reset: () => void;
}

export function PageError({ title, description, backHref, backLabel, error, reset }: PageErrorProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-foreground/60">{description}</p>
      <p className="mt-4 rounded-lg border border-red-500/20 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error.message}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          Try again
        </button>
        <Link href={backHref} className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5">
          {backLabel}
        </Link>
      </div>
    </main>
  );
}
```

**2. Rewrite each page error boundary** to be a thin wrapper:

```tsx
// src/app/ingest/error.tsx
"use client";
import { PageError } from "@/components/ErrorBoundary";

export default function IngestError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError title="Ingest error" description="Something went wrong while ingesting content." backHref="/" backLabel="← Home" error={error} reset={reset} />;
}
```

Same pattern for all 4 files. Each becomes ~5 lines.

**3. Leave `src/app/error.tsx` (global) as-is** — it has a different structure (different heading size, no error box styling) and is the root fallback, so it's fine to stay independent.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

This is a pure refactor — no behavior change. Build passing is sufficient verification.
