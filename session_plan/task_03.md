Title: Mobile-responsive NavHeader with collapsible menu
Files: src/components/NavHeader.tsx
Issue: none

## Problem

The NavHeader renders 7 navigation links (`Browse`, `Graph`, `Log`, `Raw`, `Ingest`, `Query`, `Lint`) plus the `LLM Wiki` brand in a single horizontal row. On mobile screens (<640px), this overflows and either wraps awkwardly or gets clipped. The assessment flags this as gap #10.

## Fix

Add a hamburger menu button that's visible only on small screens (`sm:hidden`), and hide the horizontal link list on small screens (`hidden sm:flex`). When the hamburger is clicked, toggle a vertical dropdown menu below the header.

### Implementation details

Since this is a `"use client"` component already (uses `usePathname`), we can add `useState` for the mobile menu toggle:

```tsx
const [mobileOpen, setMobileOpen] = useState(false);
```

Structure:
1. **Desktop nav** (existing `<ul>`): Add `hidden sm:flex` so it's hidden on mobile
2. **Hamburger button**: Add a `sm:hidden` button with a simple ☰ icon (three lines via SVG or Unicode)
3. **Mobile dropdown**: When `mobileOpen` is true, render a `<div>` below the header bar with the nav links stacked vertically. Use `absolute` positioning so it overlays content. Close on link click.

### Styling approach

- Mobile menu: `absolute top-14 left-0 right-0 bg-gray-900 border-b border-gray-800 py-2`
- Each link in mobile menu: `block px-6 py-2 text-sm` (full-width tap targets)
- Active link styling: same as desktop (white + semibold + bg-gray-800)
- Close menu when a link is clicked (reset `mobileOpen` to false)
- Close menu when pathname changes (use `useEffect` watching pathname)

### Hamburger icon

Use a simple SVG hamburger (3 horizontal lines). No need for an icon library:
```tsx
<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
</svg>
```

When open, optionally switch to an X icon:
```tsx
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
```

### Constraints

- Touch only `NavHeader.tsx` — this is a self-contained component change
- No new dependencies
- Desktop behavior unchanged (hamburger hidden on `sm:` and above)
- All existing functionality preserved (active link detection, sticky positioning)

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Visual verification: resize browser below 640px width — hamburger appears, links are accessible via dropdown.
