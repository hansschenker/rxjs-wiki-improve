Title: LLM retry with exponential backoff
Files: src/lib/llm.ts, src/lib/constants.ts, src/lib/__tests__/llm.test.ts
Issue: none

## Description

Add automatic retry with exponential backoff to `callLLM()` so transient provider
errors (429 rate limit, 503 service unavailable, network timeouts) don't silently
fail the operation. This is the #1 infrastructure gap — every LLM-dependent feature
(ingest, query, lint contradiction check) goes through this single function.

### Changes

**src/lib/constants.ts** — Add three new constants:
```
export const LLM_MAX_RETRIES = 3;
export const LLM_RETRY_BASE_MS = 1000;    // 1s, 2s, 4s
export const LLM_RETRY_MAX_MS = 10_000;   // cap at 10s
```

**src/lib/llm.ts** — Add a `retryWithBackoff` helper:
- Accept `fn: () => Promise<T>`, `maxRetries`, `baseMs`, `maxMs`
- On failure, check if error is retryable:
  - HTTP status 429, 500, 502, 503, 504 → retryable
  - Network errors (ECONNRESET, ETIMEDOUT, fetch failed) → retryable
  - Auth errors (401, 403), validation errors (400), "no API key" → NOT retryable
- Sleep `min(baseMs * 2^attempt, maxMs)` with ±20% jitter, then retry
- On final failure, throw the last error
- Log retries to console.warn with attempt number

Wrap the `generateText()` call in `callLLM()` with this retry helper.

Do NOT add retry to `callLLMStream()` — streaming retries need different handling
(the stream may have already emitted partial data). Leave a TODO comment.

**src/lib/__tests__/llm.test.ts** — Add tests:
- `retryWithBackoff` retries on retryable errors up to maxRetries
- `retryWithBackoff` does NOT retry on non-retryable errors (throws immediately)
- `retryWithBackoff` succeeds if a retry attempt succeeds
- `retryWithBackoff` throws the last error after exhausting retries
- Backoff timing is approximately correct (use `vi.useFakeTimers` or just check call count)

Export `retryWithBackoff` and `isRetryableError` for testability (they're useful
utilities in their own right).

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```
