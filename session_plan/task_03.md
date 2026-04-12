Title: Replace bare catch blocks in lint.ts, embeddings.ts, ingest.ts, config.ts, query-history.ts
Files: src/lib/lint.ts, src/lib/embeddings.ts, src/lib/ingest.ts, src/lib/config.ts, src/lib/query-history.ts
Issue: none

## Context

This is the second half of the "silent error swallowing" cleanup. Task 02 handles wiki.ts and query.ts. This task handles the remaining 12 bare `catch {}` blocks across 5 library files.

## Approach

For each bare `catch {}`, add `catch (err) { console.warn('[module] <operation> failed:', err); }`. Do NOT change return values or control flow — these catches exist because callers expect graceful fallbacks.

### Files and locations:

**lint.ts** (4 catches around lines 17, 290, 388, 523):
- Read each to understand what's being caught (likely JSON parsing, file reads, LLM calls)
- Add descriptive console.warn with `[lint]` prefix

**embeddings.ts** (2 catches around lines 227, 435):
- Likely vector store load/save errors
- Add console.warn with `[embeddings]` prefix

**ingest.ts** (3 catches around lines 126, 197, 587):
- Likely URL fetch, Readability extraction, content processing
- Add console.warn with `[ingest]` prefix

**config.ts** (2 catches around lines 70, 109):
- Likely config file read/parse errors
- Add console.warn with `[config]` prefix

**query-history.ts** (1 catch around line 52):
- Likely history file read error
- Add console.warn with `[query-history]` prefix

### Guidelines

1. Use `catch (err)` instead of bare `catch {}`
2. Include the module name in brackets: `[lint]`, `[embeddings]`, etc.
3. Include a description of what operation failed: "parse config", "load vector store", etc.
4. Keep `console.warn` (not `console.error`) since these are expected-possible failures with fallbacks
5. Do NOT add `console.warn` for catches that already have named error variables and logging

### Test impact

Existing tests should pass unchanged since return values and control flow are identical. If any test spy on console.warn and would break, update the spy expectations.

## Verification
```sh
pnpm build && pnpm lint && pnpm test
```
