Title: Enrich graph view with node sizing, hover tooltips, and connection counts
Files: src/app/api/wiki/graph/route.ts, src/app/wiki/graph/page.tsx
Issue: none

The graph view currently renders all nodes identically — same size, same color, no metadata beyond the label. The journal has flagged "improving the graph view with backlink counts and clustering" as a natural next step for at least 5 sessions running.

## Changes

### 1. API enrichment (`src/app/api/wiki/graph/route.ts`)
- For each node, compute `linkCount` — the total number of connections (inbound + outbound edges).
- Return `linkCount` as part of each node object: `{ id, label, linkCount }`.
- Also add a `tags` field to each node by reading the page's frontmatter tags (use `readWikiPageWithFrontmatter` from wiki.ts). This enables future tag-based coloring.

### 2. Graph rendering upgrades (`src/app/wiki/graph/page.tsx`)
- **Node sizing**: Scale node radius by connection count. Formula: `baseRadius + Math.sqrt(linkCount) * scaleFactor` with min/max clamping (e.g., min 6px, max 24px). This makes hub pages visually prominent.
- **Hover tooltip**: On `mousemove`, detect which node (if any) the cursor is over. Display a tooltip near the cursor showing: node label, connection count (e.g., "Machine Learning — 7 connections"). Use canvas-drawn tooltip (no DOM overlay) to keep it simple.
- **Cursor change**: Set `cursor: pointer` when hovering a node, `cursor: default` otherwise, by updating `canvas.style.cursor` in the mousemove handler.
- **Edge thickness**: Scale edge stroke width slightly for nodes with more connections, or keep uniform — agent's discretion. Keep it subtle.
- **Legend**: Add a small text note below the canvas: "Node size reflects connection count."

### Constraints
- Keep all rendering on canvas (no switching to SVG/D3 DOM).
- Don't add new dependencies.
- Keep the `GraphNode` interface backward-compatible (linkCount is additive).
- Update the `GraphData` fetch handler to handle the new fields gracefully (default `linkCount` to 0 if the API returns an older format for some reason).

### Verification
```sh
pnpm build && pnpm lint && pnpm test
```
