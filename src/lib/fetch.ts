import net from "net";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import {
  MAX_RESPONSE_SIZE,
  MAX_CONTENT_LENGTH,
  FETCH_TIMEOUT_MS,
} from "./constants";

// ---------------------------------------------------------------------------
// URL detection & fetching
// ---------------------------------------------------------------------------

/** Check if a string looks like a URL (starts with http:// or https://). */
export function isUrl(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

/**
 * Strip HTML to plain text using a simple regex-based approach.
 *
 * 1. Remove <script>, <style>, <nav>, <header>, <footer> elements entirely
 * 2. Strip remaining HTML tags
 * 3. Decode common HTML entities
 * 4. Collapse whitespace
 */
export function stripHtml(html: string): string {
  let text = html;

  // Remove elements whose content should be discarded entirely
  const removeTags = ["script", "style", "nav", "header", "footer", "noscript"];
  for (const tag of removeTags) {
    const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi");
    text = text.replace(re, " ");
  }

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Common named HTML5 entities
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&trade;/g, "\u2122")
    .replace(/&copy;/g, "\u00A9")
    .replace(/&reg;/g, "\u00AE")
    .replace(/&bull;/g, "\u2022")
    .replace(/&middot;/g, "\u00B7")
    // Numeric entities: &#123; and &#x1F;
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extract the <title> content from HTML.
 * Falls back to empty string if not found.
 */
export function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return "";
  // Strip any inner tags and collapse whitespace
  return match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Extract article content from HTML using @mozilla/readability + linkedom.
 * Returns `null` when Readability cannot identify an article in the page.
 */
export function extractWithReadability(
  html: string,
): { title: string; textContent: string } | null {
  try {
    const { document } = parseHTML(html);
    const reader = new Readability(document);
    const article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 0) {
      return {
        title: article.title || "",
        textContent: article.textContent.trim(),
      };
    }
    return null;
  } catch (err) {
    console.warn("[ingest] Readability extraction failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// SSRF protection
// ---------------------------------------------------------------------------

/** Blocked hostname suffixes for local/internal DNS names. */
const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost"];

/** Blocked exact hostnames. */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
]);

/**
 * Check whether an IPv4 address string falls in a private/reserved range.
 *
 *  - 10.0.0.0/8
 *  - 172.16.0.0/12
 *  - 192.168.0.0/16
 *  - 169.254.0.0/16 (link-local, cloud metadata)
 *  - 127.0.0.0/8 (loopback)
 *  - 0.0.0.0/8
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  return false;
}

/**
 * Check whether an IPv6 address string falls in a private/reserved range.
 *
 *  - ::1 (loopback)
 *  - fd00::/8 (unique local address)
 *  - fe80::/10 (link-local)
 */
function isPrivateIPv6(ip: string): boolean {
  // Normalise: lowercase, strip brackets
  const normalized = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;

  // IPv4-mapped IPv6: ::ffff:A.B.C.D or ::ffff:XXXX:XXXX (hex form)
  if (normalized.startsWith("::ffff:")) {
    const suffix = normalized.slice(7); // after "::ffff:"
    if (net.isIPv4(suffix)) {
      // Dotted-decimal form: ::ffff:127.0.0.1
      return isPrivateIPv4(suffix);
    }
    // Hex form: ::ffff:7f00:1 (URL class normalizes to this)
    const hexMatch = suffix.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMatch) {
      const hi = parseInt(hexMatch[1], 16);
      const lo = parseInt(hexMatch[2], 16);
      const a = (hi >> 8) & 0xff;
      const b = hi & 0xff;
      const c = (lo >> 8) & 0xff;
      const d = lo & 0xff;
      return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
    }
  }

  return false;
}

/**
 * Validate that a URL is safe to fetch — reject private/reserved addresses
 * and non-HTTP(S) schemes to prevent SSRF attacks.
 *
 * @throws Error if the URL targets a private/reserved address or uses a
 *   non-HTTP(S) scheme.
 */
export function validateUrlSafety(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (err) {
    console.warn("[ingest] URL parse failed:", err);
    throw new Error("URL blocked: invalid URL");
  }

  // Only allow http and https schemes
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `URL blocked: scheme "${parsed.protocol.replace(":", "")}" is not allowed (only http/https)`,
    );
  }

  // Extract hostname (URL class may keep brackets around IPv6 literals)
  const rawHostname = parsed.hostname.toLowerCase();
  // Strip brackets for IPv6 literals so lookups work correctly
  const hostname = rawHostname.startsWith("[") && rawHostname.endsWith("]")
    ? rawHostname.slice(1, -1)
    : rawHostname;

  // Check exact blocked hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error(
      "URL blocked: hostname resolves to a private/reserved address",
    );
  }

  // Check blocked suffixes
  for (const suffix of BLOCKED_HOST_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      throw new Error(
        "URL blocked: hostname resolves to a private/reserved address",
      );
    }
  }

  // If the hostname is a raw IP address, check private ranges
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4 && isPrivateIPv4(hostname)) {
    throw new Error(
      "URL blocked: hostname resolves to a private/reserved address",
    );
  }
  if (ipVersion === 6 && isPrivateIPv6(hostname)) {
    throw new Error(
      "URL blocked: hostname resolves to a private/reserved address",
    );
  }
}

// MIME types that fetchUrlContent will accept. Anything outside this list
// (e.g. application/pdf, image/png) is rejected early to avoid feeding binary
// garbage into the HTML-parsing pipeline.
const ALLOWED_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "text/plain",
  "text/markdown",
  "application/xml",
  "text/xml",
];

/**
 * Fetch a URL and extract its text content and title.
 *
 * Uses @mozilla/readability + linkedom for robust HTML-to-text extraction.
 * Falls back to regex-based `stripHtml()` when Readability can't parse the page.
 * Applies a 15-second timeout and a 5 MB response size limit for safety.
 *
 * For `text/plain` and `text/markdown` responses the raw text is returned
 * directly (no HTML parsing).
 */
export async function fetchUrlContent(
  url: string,
): Promise<{ title: string; content: string }> {
  // SSRF protection: reject private/reserved addresses before fetching
  validateUrlSafety(url);

  // Maximum number of redirect hops to follow
  const MAX_REDIRECTS = 5;
  const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

  let currentUrl = url;
  let response: Response | undefined;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    response = await fetch(currentUrl, {
      headers: {
        "User-Agent": "llm-wiki/1.0",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "manual",
    });

    if (!REDIRECT_STATUSES.has(response.status)) {
      break; // Not a redirect — proceed with this response
    }

    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`Redirect (${response.status}) without Location header`);
    }

    // Resolve relative redirects against the current URL
    const resolvedUrl = new URL(location, currentUrl).toString();

    // SSRF: validate the redirect target before following it
    validateUrlSafety(resolvedUrl);

    currentUrl = resolvedUrl;

    if (hop === MAX_REDIRECTS) {
      throw new Error(`Too many redirects (max ${MAX_REDIRECTS})`);
    }
  }

  if (!response) {
    throw new Error("No response received");
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch URL: ${response.status} ${response.statusText}`,
    );
  }

  // ---------- Content-Type validation ----------
  const rawContentType = response.headers.get("content-type");
  // Extract the MIME type (before any ";charset=..." parameters)
  const mimeType = rawContentType
    ? rawContentType.split(";")[0].trim().toLowerCase()
    : null;

  if (mimeType && !ALLOWED_CONTENT_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported content type: ${mimeType}. Only HTML and text content can be ingested.`,
    );
  }

  // Check Content-Length header before reading body (early rejection)
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
    throw new Error(
      `Content too large: ${contentLength} bytes (max ${MAX_RESPONSE_SIZE})`,
    );
  }

  // Stream the body and enforce size limit incrementally to prevent
  // unbounded memory consumption from servers with missing/spoofed
  // Content-Length headers.
  let body: string;
  const reader = response.body?.getReader();
  if (reader) {
    const decoder = new TextDecoder();
    let accumulated = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      if (accumulated.length > MAX_RESPONSE_SIZE) {
        await reader.cancel();
        throw new Error(
          `Content too large (max ${MAX_RESPONSE_SIZE})`,
        );
      }
    }
    // Flush any remaining bytes in the decoder
    accumulated += decoder.decode();
    body = accumulated;
  } else {
    // Fallback: no streaming body available (e.g. in some test environments)
    body = await response.text();
    if (body.length > MAX_RESPONSE_SIZE) {
      throw new Error(
        `Content too large (max ${MAX_RESPONSE_SIZE})`,
      );
    }
  }

  let title: string;
  let content: string;

  // For plain-text and markdown responses, skip the HTML parsing path entirely
  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    title = new URL(url).hostname;
    content = body.trim();
  } else {
    // HTML / XHTML / XML path — try Readability first for proper article extraction
    const article = extractWithReadability(body);
    if (article) {
      title = article.title || extractTitle(body) || new URL(url).hostname;
      content = article.textContent;
    } else {
      // Fallback to regex-based stripping for non-article pages
      title = extractTitle(body) || new URL(url).hostname;
      content = stripHtml(body);
    }
  }

  if (!content) {
    throw new Error("No text content could be extracted from the URL");
  }

  // Truncate very long extracted text to a reasonable size for LLM processing
  if (content.length > MAX_CONTENT_LENGTH) {
    content = content.slice(0, MAX_CONTENT_LENGTH) + "\n\n[Content truncated]";
  }

  return { title, content };
}
