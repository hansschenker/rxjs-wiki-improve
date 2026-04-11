Title: Add error boundaries and loading states for all routes
Files: src/app/error.tsx (create), src/app/loading.tsx (create), src/app/wiki/[slug]/not-found.tsx (create), src/app/layout.tsx (modify)
Issue: none

## Description

No route in the app has an `error.tsx` or `loading.tsx` file. Server components that do disk I/O (wiki page view, raw source view, wiki index) will show blank pages or Next.js default error screens on failure. Add error boundaries and loading states.

### Steps

1. **Create `src/app/error.tsx`** — a root-level error boundary (must be a client component):
   - "use client" directive
   - Accept `error` and `reset` props (standard Next.js error boundary interface)
   - Show a clean error message with the error text
   - Include a "Try again" button that calls `reset()`
   - Include a "Go home" link
   - Style consistently with the app's existing design language (same `mx-auto max-w-3xl px-6 py-12` container pattern)

2. **Create `src/app/loading.tsx`** — a root-level loading state:
   - Show a minimal loading indicator (a pulsing dot or simple "Loading..." text)
   - Use the same container layout as other pages
   - Keep it simple — this is a fallback for server component suspense boundaries

3. **Create `src/app/wiki/[slug]/not-found.tsx`** — a not-found page for wiki slugs:
   - Import `notFound` usage pattern: the existing `page.tsx` already handles "not found" inline, but having a dedicated `not-found.tsx` gives Next.js a proper 404 page for this route segment
   - Show "Page not found" with a link back to the wiki index
   - Suggest creating the page or checking the slug spelling

4. **Verify layout.tsx** doesn't need changes — the root error boundary should work automatically with the existing layout.

### Design Notes

- Keep all three files minimal — under 50 lines each
- Match the existing app aesthetic: `text-foreground`, `bg-background`, consistent spacing
- The error boundary must be `"use client"` — this is a Next.js requirement
- Loading state should not flash (avoid spinner if possible — use subtle animation)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

These are new files with no logic to test — just verify they compile and the build succeeds.
