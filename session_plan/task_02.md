Title: Add global search bar to NavHeader
Files: src/components/NavHeader.tsx, src/components/GlobalSearch.tsx (new)
Issue: none

Gap #11 from the assessment: "No global search bar in the nav header." The wiki index has local search, but users can't search from other pages. A compact, keyboard-accessible search in the header makes wiki navigation much faster.

## Changes

### 1. New component: `src/components/GlobalSearch.tsx`
Create a client component that:
- Renders a compact search input in the nav bar (collapsed to an icon on mobile, expandable on click/keyboard shortcut).
- On typing, fetches the wiki index from `/api/wiki/graph` (which returns all page slugs and labels) or alternatively hits a lightweight endpoint. Since the wiki index is already loaded by `WikiIndexClient` via server props, and we need a client-side solution, fetch `/api/wiki/graph` which returns `{ nodes: [{id, label}], edges }` and filter nodes client-side.
  - Actually, better approach: fetch the existing wiki page list. The simplest is to call the graph endpoint (already exists, returns all slugs+labels). Cache the result in component state.
- Filter results as the user types (case-insensitive substring match on label).
- Show a dropdown of up to 8 matching results below the search input.
- Clicking a result or pressing Enter navigates to `/wiki/{slug}`.
- Pressing `Escape` closes the dropdown and clears search.
- Keyboard shortcut: `/` to focus the search bar (only when not already in an input/textarea). This is a common wiki convention.
- Pressing `Cmd+K` or `Ctrl+K` also focuses the search bar.

### 2. Integrate into NavHeader (`src/components/NavHeader.tsx`)
- Import and render `<GlobalSearch />` in the desktop nav bar, between the nav links and utility links.
- On mobile, place it in the mobile menu dropdown, or keep as a small icon that expands.
- Keep the NavHeader clean — the search component manages its own state and dropdown.

### Design constraints
- No new dependencies (no search libraries).
- Dropdown should be styled with Tailwind, positioned absolutely below the input.
- Use `z-50` or higher for the dropdown to ensure it floats above page content.
- Close dropdown on click-outside (add a `mousedown` listener on document).
- Keep it lightweight — this is a client-side filter over a cached page list, not a server search.

### Verification
```sh
pnpm build && pnpm lint && pnpm test
```
