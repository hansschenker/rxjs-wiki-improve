Title: Fix NavHeader active state bug and improve home page with actionable links
Files: src/components/NavHeader.tsx, src/app/page.tsx
Issue: none

## Description

Two UX issues from the assessment:

1. **NavHeader active state bug** (Bug #3): Both "Browse" and "Graph" show as active on `/wiki/graph` because the `startsWith("/wiki")` check matches both nav items. Graph is at `/wiki/graph` and Browse is at `/wiki`.
2. **Home page has no actionable links** (Friction #7): The page just says "use the navigation above" with no direct links to any features.

### Implementation Plan

1. **Fix `src/components/NavHeader.tsx` active state logic**:
   - Current logic: `pathname === href || pathname.startsWith(href + "/")`
   - For `/wiki/graph`, this matches both `/wiki` (since `/wiki/graph` starts with `/wiki/`) and `/wiki/graph` (exact match)
   - Fix: make the "Browse" link (`/wiki`) only active if pathname is exactly `/wiki` OR starts with `/wiki/` but is NOT `/wiki/graph` or `/wiki/graph/`
   - Cleaner approach: change the active detection to use **exact match** for all nav items, with the exception that `/wiki/[slug]` pages (but not `/wiki/graph`) should highlight "Browse"
   - Simplest correct approach: check each link; for `/wiki`, match pathname === "/wiki" OR (pathname starts with "/wiki/" AND NOT pathname starts with "/wiki/graph"); for all other links, use exact match or startsWith as before
   - Alternative: reorder navLinks to check more specific paths first and use an `isActive` function that finds the best (longest) matching prefix. This is cleaner.

2. **Update `src/app/page.tsx`** with actionable links:
   - Add 3-4 card-style links to the main features: Ingest, Browse, Query, Lint
   - Each card has a title, short description, and links to the respective page
   - Use Next.js `Link` component
   - Keep the existing hero text but replace the "use navigation above" paragraph with the cards
   - Use simple Tailwind grid layout (2x2 on desktop, 1 column on mobile)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```
