Title: Harden SSRF protection — redirect bypass, IPv4-mapped IPv6, streaming body size check
Files: src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## Problem

Three SSRF bypass vectors exist in `fetchUrlContent()` and `validateUrlSafety()`:

1. **Redirect bypass**: `fetch()` follows redirects by default. A public URL can redirect to `http://169.254.169.254/latest/meta-data/` (cloud metadata endpoint) or `http://127.0.0.1/`. The pre-fetch `validateUrlSafety()` check only validates the initial URL.

2. **IPv4-mapped IPv6 bypass**: `isPrivateIPv6()` doesn't recognize `::ffff:127.0.0.1` or `::ffff:10.0.0.1` — standard IPv4-mapped IPv6 addresses that resolve to private IPs. These bypass both the IPv4 and IPv6 checks.

3. **Body size check after full read**: `response.text()` at line 309 reads the entire body into memory before the size check at line 312. A server with a missing or spoofed `Content-Length` header can send gigabytes of data that fills memory before being rejected.

## Implementation

### 1. Redirect bypass fix (in `fetchUrlContent`)

Change the fetch call to `redirect: "manual"`:

```typescript
const response = await fetch(url, {
  headers: { ... },
  signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  redirect: "manual",
});
```

After getting the response, check for redirect status codes (301, 302, 303, 307, 308). If redirected:
- Extract the `Location` header
- Resolve it against the original URL (it may be relative)
- Run `validateUrlSafety()` on the resolved redirect URL
- Fetch the redirect target (also with `redirect: "manual"`)
- Limit to a maximum of 5 redirect hops to prevent infinite loops

### 2. IPv4-mapped IPv6 fix (in `isPrivateIPv6`)

Add detection for `::ffff:` prefix. If the address starts with `::ffff:`, extract the IPv4 portion and check it with `isPrivateIPv4()`:

```typescript
// IPv4-mapped IPv6: ::ffff:A.B.C.D
if (normalized.startsWith("::ffff:")) {
  const ipv4Part = normalized.slice(7); // after "::ffff:"
  if (net.isIPv4(ipv4Part)) {
    return isPrivateIPv4(ipv4Part);
  }
}
```

### 3. Streaming body size check (in `fetchUrlContent`)

Replace `response.text()` with a streaming reader that accumulates chunks and aborts if the total exceeds `MAX_RESPONSE_SIZE`:

```typescript
const reader = response.body?.getReader();
if (!reader) throw new Error("No response body");
const decoder = new TextDecoder();
let body = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  body += decoder.decode(value, { stream: true });
  if (body.length > MAX_RESPONSE_SIZE) {
    reader.cancel();
    throw new Error(`Content too large (max ${MAX_RESPONSE_SIZE})`);
  }
}
```

This prevents unbounded memory consumption from large responses.

## Tests to add

In `src/lib/__tests__/ingest.test.ts`, add tests in the `validateUrlSafety` describe block:

- `it("blocks IPv4-mapped IPv6 loopback (::ffff:127.0.0.1)")` — should throw
- `it("blocks IPv4-mapped IPv6 private (::ffff:10.0.0.1)")` — should throw  
- `it("blocks IPv4-mapped IPv6 link-local (::ffff:169.254.169.254)")` — should throw
- `it("allows IPv4-mapped IPv6 public (::ffff:8.8.8.8)")` — should NOT throw

For redirect handling, since `fetchUrlContent` calls real `fetch`, test the redirect logic by:
- Adding tests that verify `redirect: "manual"` is used (mock `fetch`)
- Or testing the redirect-validation helper function if extracted

## Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All existing SSRF tests must still pass. New tests must pass.
