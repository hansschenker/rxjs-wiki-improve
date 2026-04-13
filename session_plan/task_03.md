Title: Fix graph canvas HiDPI rendering and accessibility
Files: src/app/wiki/graph/page.tsx
Issue: none

Two issues with the graph canvas — one visual, one accessibility:

## 1. HiDPI / Retina blurriness

The canvas doesn't account for `window.devicePixelRatio`. On Retina displays (DPR=2), the canvas renders at half resolution and is scaled up by the browser, producing blurry nodes and text.

Fix: In the canvas setup (likely in a useEffect or init function):

```ts
const dpr = window.devicePixelRatio || 1;
canvas.width = containerWidth * dpr;
canvas.height = containerHeight * dpr;
canvas.style.width = `${containerWidth}px`;
canvas.style.height = `${containerHeight}px`;
ctx.scale(dpr, dpr);
```

Also update any mouse event coordinate calculations to NOT multiply by DPR (since the CSS size stays the same, mouse events are already in CSS pixels — the `ctx.scale` handles the mapping).

Search for where `canvas.width` and `canvas.height` are set, and where mouse coordinates are calculated (e.g., `getBoundingClientRect` + `clientX/clientY`). Make sure the coordinate transform is consistent.

## 2. Accessibility

The canvas element has no accessibility attributes. Screen reader users get nothing.

Fix: Add these attributes to the `<canvas>` element:
```tsx
<canvas
  ref={canvasRef}
  role="img"
  aria-label="Wiki page relationship graph. Visit the wiki index for a text-based list of all pages."
  tabIndex={0}
/>
```

The `role="img"` tells screen readers this is a visual element, the `aria-label` provides a text alternative with guidance to the accessible wiki index, and `tabIndex={0}` makes it focusable.

Also add a visually-hidden fallback text inside the canvas tag (for browsers without canvas support and as additional screen reader context):
```tsx
<canvas ...>
  Wiki relationship graph — see wiki index for accessible page listing.
</canvas>
```

## Testing

No unit tests needed for canvas rendering. Verify:
- `pnpm build && pnpm lint && pnpm test` passes
- No TypeScript errors
- The canvas element has the accessibility attributes in the built output
