Title: File-level write locking for shared wiki files
Files: src/lib/lock.ts, src/lib/wiki.ts, src/lib/__tests__/wiki.test.ts
Issue: none

## Description

Add file-level write locking to prevent TOCTOU races on shared files (`index.md`,
`log.md`). This is explicitly flagged in SCHEMA.md as a known gap. Two browser tabs
or two concurrent ingest calls can corrupt these files because read-modify-write
sequences are not atomic.

### Design

**src/lib/lock.ts** — New module (~60 lines), in-process mutex keyed by file path:
- `withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T>`
- Uses a Map of promise chains — each new call for the same key chains onto the
  previous promise, ensuring serial execution per key
- No external dependencies (no lockfile packages)
- This is an in-process lock — it won't protect against multiple server processes,
  but Next.js dev and production single-instance modes only have one process

Implementation pattern:
```ts
const locks = new Map<string, Promise<unknown>>();

export async function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn); // run fn after previous completes (even if previous failed)
  locks.set(key, next.catch(() => {})); // prevent unhandled rejection on the chain
  return next;
}
```

**src/lib/wiki.ts** — Wrap the three critical sections:
1. `updateIndex()` — the read-modify-write of index.md
2. `appendToLog()` — the append to log.md
3. `updateRelatedPages()` — the scan-and-rewrite of related pages

Each wraps its body in `withFileLock("index.md", ...)` / `withFileLock("log.md", ...)`
/ `withFileLock("cross-ref", ...)`.

**src/lib/__tests__/wiki.test.ts** — Add 2–3 concurrency tests:
- Two concurrent `updateIndex()` calls both succeed (no data loss)
- Two concurrent `appendToLog()` calls both appear in the log
- Import and test `withFileLock` directly: concurrent calls execute serially

### Non-goals
- No cross-process locking (would need lockfiles, out of scope)
- No locking on individual page writes (low collision risk, not worth the overhead)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

Also update the misleading comment in lifecycle.ts line 195 ("Re-read so we never
clobber concurrent updates") to accurately describe what the locking guarantees.
