Title: Fix isRetryableError false positives from message regex matching
Files: src/lib/llm.ts, src/lib/__tests__/llm.test.ts
Issue: none

## Problem

`isRetryableError()` in `llm.ts` uses a regex `message.match(/\b(4\d{2}|5\d{2})\b/)` to detect HTTP status codes in error messages. This is too broad — it matches any 3-digit number between 400–599 anywhere in the message text.

Real-world false positives:
- `"limit of 500 tokens"` → matches "500" → treated as retryable server error
- `"maximum 400 characters"` → matches "400" → treated as non-retryable (blocks retry even for network errors later in the same message)
- `"context window of 512 tokens"` → matches "512" → treated as server error

The `.status` property check (lines 63-69) is more reliable but runs AFTER the message regex, so the regex always wins.

## Implementation

Restructure `isRetryableError()` to check `.status` property FIRST, message regex LAST:

```typescript
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  
  // 1. Explicitly non-retryable patterns — bail early
  if (message.includes("no llm api key")) return false;
  
  // 2. Check for a `status` property FIRST (most reliable signal)
  const errWithStatus = error as Error & { status?: number };
  if (typeof errWithStatus.status === "number") {
    const s = errWithStatus.status;
    if (s >= 400 && s < 500 && s !== 429) return false;
    if (RETRYABLE_STATUS_CODES.has(s)) return true;
  }
  
  // 3. Check for network-level error messages
  if (RETRYABLE_MESSAGES.some((msg) => message.includes(msg))) return true;
  
  // 4. Last resort: look for HTTP status codes in the message,
  //    but only in patterns that look like actual HTTP status reports,
  //    not incidental numbers in limit descriptions.
  const statusMatch = message.match(/\bstatus[:\s]+(\d{3})\b|\b(\d{3})\s+(error|too many|rate limit|overloaded|unavailable|bad gateway|gateway timeout)/i);
  if (statusMatch) {
    const status = parseInt(statusMatch[1] || statusMatch[2], 10);
    if (status >= 400 && status < 500 && status !== 429) return false;
    if (RETRYABLE_STATUS_CODES.has(status)) return true;
  }
  
  return false;
}
```

Key changes:
1. `.status` property checked before message parsing
2. Message regex tightened to only match patterns that look like HTTP status reports: `"status: 503"`, `"status 429"`, `"503 error"`, `"429 too many"`, `"503 unavailable"`, etc.
3. Network error messages still checked (ECONNRESET, ETIMEDOUT, etc.)

## Tests to update/add

In `src/lib/__tests__/llm.test.ts`:

**Fix existing tests** that rely on bare numbers in messages:
- `"Internal server error 500"` → still works (matches "500" after "error")
- `"Bad gateway 502"` → still works (matches "502" after "gateway") 
- etc. — verify all existing tests still pass with the tighter regex

**Add new false-positive tests:**
- `it("does not retry on 'limit of 500 tokens' message")` — message contains 500 but isn't a server error
- `it("does not treat 'maximum 400 characters' as non-retryable when status is 429")` — `.status` should win over message regex
- `it("prefers .status property over message text")` — error with `.status: 429` but message containing "400" → retryable

**Add HTTP-status-in-message pattern tests:**
- `it("retries on 'status: 503' in message")` — matches tighter pattern
- `it("retries on 'status 429' in message")` — matches tighter pattern

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All existing `isRetryableError` tests must still pass. New tests must pass. Run the full test suite to ensure no regressions.
