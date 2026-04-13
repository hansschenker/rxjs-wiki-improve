Title: Graph clustering — color nodes by community detection
Files: src/lib/graph.ts, src/lib/__tests__/graph.test.ts, src/app/wiki/graph/page.tsx
Issue: none

## Problem

The graph view shows all wiki pages as identically-colored blue nodes. As the wiki grows, it becomes hard to see which pages form natural clusters/communities. The journal has noted "graph clustering" as a next step for ~10 sessions without action.

## Plan

### 1. Create `src/lib/graph.ts` — community detection utility (~50 lines)

Implement **label propagation** — a simple, well-known community detection algorithm that requires zero external dependencies:

```typescript
interface ClusterInput {
  nodes: string[];          // node IDs
  edges: [string, string][]; // pairs of connected node IDs
}

interface ClusterResult {
  clusters: Map<string, number>;  // node ID → cluster index
  count: number;                   // number of distinct clusters
}

export function detectCommunities(input: ClusterInput): ClusterResult
```

Algorithm:
1. Assign each node a unique label (its index)
2. Iterate: for each node (in random order), adopt the most common label among neighbors
3. Repeat until convergence or max iterations (e.g., 10)
4. Return the label assignments as cluster indices

Disconnected nodes get their own cluster. Nodes with no edges form singleton clusters.

### 2. Create `src/lib/__tests__/graph.test.ts` (~60 lines)

Test cases:
- Empty graph → empty clusters
- Single node → one cluster
- Two disconnected components → two clusters
- Fully connected graph → one cluster
- Chain graph → one cluster
- Two distinct cliques connected by a single bridge → two clusters (or possibly one — label propagation is non-deterministic, so test the structural invariants: at most 2 clusters, nodes within the same clique share a cluster)

### 3. Modify `src/app/wiki/graph/page.tsx` (~40 lines of changes)

After fetching graph data and creating nodes:
- Call `detectCommunities({ nodes: ids, edges: edgePairs })`
- Create a color palette of ~8-10 distinct colors (e.g., Tailwind palette: blue, emerald, amber, rose, violet, cyan, orange, lime)
- In the render loop, replace the single `palette.node` fill color with `clusterColors[node.cluster % clusterColors.length]`
- Add the cluster index to the `GraphNode` interface
- Add a small legend showing cluster colors and counts (bottom-left corner of canvas)

### Key constraint

Label propagation is non-deterministic (depends on iteration order). For stable visual results, seed the shuffle with a deterministic approach (e.g., sort by node ID before each pass, or use a fixed sequence). This avoids jarring color changes on page refresh.

## Verification

- `pnpm build && pnpm lint && pnpm test`
- New tests in graph.test.ts pass
- Visual verification: the graph page should show multi-colored nodes (if wiki has >1 cluster)
