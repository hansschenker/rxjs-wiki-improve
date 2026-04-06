Title: Fix URL fetch safety + MarkdownRenderer SPA navigation
Files: src/lib/ingest.ts, src/components/MarkdownRenderer.tsx, src/lib/__tests__/ingest.test.ts
Issue: none

## Problem

Two bugs identified in the assessment:

1. **`fetchUrlContent` has no timeout or size limit** — could hang indefinitely or OOM on huge pages. Should add `AbortSignal.timeout()` and a content size cap.

2. **MarkdownRenderer internal links cause full page reloads** — uses raw `<a>` elements for `*.md` internal links instead of Next.js `<Link>` component. External links also lack `target="_blank"` and `rel="noopener noreferrer"`.

## Implementation

### 1. Harden `fetchUrlContent` in `src/lib/ingest.ts`

Add two safety measures:

**Timeout:** Use `AbortSignal.timeout(15000)` (15 seconds) in the fetch options. This is a built-in Node.js/browser API — no external dependency needed.

```typescript
const response = await fetch(url, {
  headers: {
    "User-Agent": "llm-wiki/1.0",
    Accept: "text/html,application/xhtml+xml,*/*",
  },
  signal: AbortSignal.timeout(15_000), // 15s timeout
});
```

**Size limit:** After getting the response, check `Content-Length` header if available. Also, read the body in chunks with a size limit. However, since `response.text()` reads the whole body at once, the simplest approach is:

```typescript
const contentLength = response.headers.get("content-length");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
  throw new Error(`Content too large: ${contentLength} bytes (max ${MAX_SIZE})`);
}

const html = await response.text();
if (html.length > MAX_SIZE) {
  throw new Error(`Content too large: ${html.length} chars (max ${MAX_SIZE})`);
}
```

Also truncate the extracted text content to a reasonable size for LLM processing (e.g., 100,000 characters) before passing to ingest:

```typescript
const content = stripHtml(html);
const MAX_CONTENT = 100_000;
const truncatedContent = content.length > MAX_CONTENT 
  ? content.slice(0, MAX_CONTENT) + "\n\n[Content truncated]"
  : content;
```

### 2. Fix MarkdownRenderer in `src/components/MarkdownRenderer.tsx`

Import Next.js `Link` and use it for internal links:

```typescript
import Link from "next/link";
```

Update the `a` component override:

```tsx
a: ({ href, children, ...props }) => {
  // Rewrite internal .md links to /wiki/ routes using Next.js Link
  if (href && href.endsWith(".md") && !href.startsWith("http")) {
    const slug = href.replace(/\.md$/, "");
    return (
      <Link href={`/wiki/${slug}`} {...props}>
        {children}
      </Link>
    );
  }
  // External links: open in new tab
  const isExternal = href && (href.startsWith("http://") || href.startsWith("https://"));
  return (
    <a 
      href={href} 
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
},
```

### 3. Add/update tests in `src/lib/__tests__/ingest.test.ts`

Add tests in the existing `fetchUrlContent` describe block:

- **Timeout test:** Mock `global.fetch` to return a promise that never resolves, verify that `fetchUrlContent` rejects (note: hard to test AbortSignal.timeout in unit tests — instead just verify the signal option is passed, or skip this specific test and test the size limit instead)
- **Size limit - Content-Length header:** Mock fetch response with `Content-Length: 10000000` header, verify it throws "Content too large"
- **Size limit - body too large:** Mock fetch with a response whose `.text()` returns a string > 5MB, verify it throws "Content too large"
- **Content truncation:** Test that very long extracted content is truncated to 100K chars with "[Content truncated]" suffix

### Verification

```bash
pnpm build && pnpm lint && pnpm test
```

All existing tests must continue to pass. New tests must pass. Specifically verify:
- The MarkdownRenderer still compiles (it's a client component with JSX)
- The ingest tests still pass (fetch mocking hasn't broken)
