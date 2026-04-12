Title: Add SSRF protection to URL ingest
Files: src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## Description

Add SSRF (Server-Side Request Forgery) protection to prevent the ingest URL fetcher from accessing internal/private network resources. This is gap #4 from the assessment: "No protection against fetching internal/private IPs. A user could point the ingest at `http://169.254.169.254/` (cloud metadata) or internal network resources."

### Implementation steps

1. **`src/lib/ingest.ts`** — Add a `validateUrlSafety(url: string)` function called at the start of `fetchUrlContent()` (before the `fetch` call):

   - Parse the URL with `new URL(url)`
   - Reject non-HTTP(S) schemes (e.g., `file://`, `ftp://`, `data:`)
   - Resolve the hostname to check if it's a private/reserved IP. Since DNS resolution in Node.js is async but `fetch` doesn't expose resolved IPs, use a hostname-based blocklist approach:
     - Block `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`
     - Block hostnames ending in `.local`, `.internal`, `.localhost`
     - Block IP addresses in private ranges: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `169.254.x.x` (link-local / cloud metadata), `fd00::/8` (IPv6 ULA)
     - Use `net.isIP()` from Node.js to detect when the hostname is a raw IP address, then check the ranges
   - Throw a descriptive error like `"URL blocked: hostname resolves to a private/reserved address"`
   - Export the function so tests can access it

2. **`src/lib/__tests__/ingest.test.ts`** — Add tests for the new validation:
   - `http://localhost/foo` → blocked
   - `http://127.0.0.1/foo` → blocked
   - `http://169.254.169.254/latest/meta-data/` → blocked (AWS metadata)
   - `http://10.0.0.1/internal` → blocked
   - `http://192.168.1.1/admin` → blocked
   - `http://172.16.0.1/` → blocked
   - `http://[::1]/` → blocked
   - `https://example.com` → allowed
   - `file:///etc/passwd` → blocked (non-HTTP scheme)
   - `ftp://files.example.com/` → blocked

### Verification
```
pnpm build && pnpm lint && pnpm test
```
