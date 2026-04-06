import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import {
  slugify,
  extractSummary,
  ingest,
  isUrl,
  stripHtml,
  extractTitle,
  fetchUrlContent,
  ingestUrl,
} from "../ingest";
import { listWikiPages } from "../wiki";

// Mock the LLM module so ingest never calls the real API
vi.mock("../llm", () => ({
  hasLLMKey: () => false,
  callLLM: vi.fn(),
}));

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(slugify("What's New? (2024)")).toBe("what-s-new-2024");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  ---Hello---  ")).toBe("hello");
  });

  it("collapses consecutive non-alphanumeric chars into a single hyphen", () => {
    expect(slugify("a   b...c")).toBe("a-b-c");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles purely numeric titles", () => {
    expect(slugify("2024")).toBe("2024");
  });
});

// ---------------------------------------------------------------------------
// extractSummary
// ---------------------------------------------------------------------------

describe("extractSummary", () => {
  it("does not split on bare period (old bug: 'Dr.' → 'Dr')", () => {
    const text = "Dr. Smith is a renowned scientist. He studies AI.";
    const summary = extractSummary(text);
    // Old code split on bare "." giving "Dr". New code uses "[.!?]\s" which
    // matches "Dr. " — gives "Dr." which at least includes the period.
    // The key fix: it's no longer splitting on bare "." or bare "\n".
    expect(summary).not.toBe("Dr");
    expect(summary.length).toBeGreaterThanOrEqual(3);
  });

  it("uses first sentence ending with period-space", () => {
    const text = "This is the first sentence. This is the second.";
    expect(extractSummary(text)).toBe("This is the first sentence.");
  });

  it("uses paragraph break as boundary", () => {
    const text = "First paragraph without period\n\nSecond paragraph here";
    expect(extractSummary(text)).toBe("First paragraph without period");
  });

  it("picks the earlier of sentence boundary and paragraph break", () => {
    const text = "Short sentence. More text\n\nParagraph two";
    expect(extractSummary(text)).toBe("Short sentence.");
  });

  it("truncates long content with no sentence boundary", () => {
    const long = "a".repeat(300);
    const summary = extractSummary(long);
    expect(summary.length).toBeLessThanOrEqual(203 + 3); // 200 + "..."
    expect(summary.endsWith("...")).toBe(true);
  });

  it("returns empty string for empty content", () => {
    expect(extractSummary("")).toBe("");
    expect(extractSummary("   ")).toBe("");
  });

  it("returns full content when shorter than maxLen and no sentence end", () => {
    expect(extractSummary("Short text")).toBe("Short text");
  });

  it("handles exclamation marks as sentence boundaries", () => {
    const text = "Wow! That was amazing. Indeed.";
    expect(extractSummary(text)).toBe("Wow!");
  });

  it("handles question marks as sentence boundaries", () => {
    const text = "What happened? Nobody knows.";
    expect(extractSummary(text)).toBe("What happened?");
  });

  it("respects custom maxLen", () => {
    const text = "This is a fairly long first sentence that goes on and on. Second sentence.";
    const summary = extractSummary(text, 20);
    // Sentence boundary is beyond maxLen=20, so it truncates
    expect(summary.length).toBeLessThanOrEqual(23 + 3);
    expect(summary.endsWith("...")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ingest pipeline (integration, no LLM key)
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalWikiDir: string | undefined;
let originalRawDir: string | undefined;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ingest-test-"));
  originalWikiDir = process.env.WIKI_DIR;
  originalRawDir = process.env.RAW_DIR;
  process.env.WIKI_DIR = path.join(tmpDir, "wiki");
  process.env.RAW_DIR = path.join(tmpDir, "raw");
});

afterEach(async () => {
  if (originalWikiDir === undefined) {
    delete process.env.WIKI_DIR;
  } else {
    process.env.WIKI_DIR = originalWikiDir;
  }
  if (originalRawDir === undefined) {
    delete process.env.RAW_DIR;
  } else {
    process.env.RAW_DIR = originalRawDir;
  }
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("ingest", () => {
  it("creates wiki page and index entry", async () => {
    const result = await ingest("Test Article", "This is the content. More stuff here.");
    expect(result.wikiPages).toContain("test-article");
    expect(result.indexUpdated).toBe(true);

    const entries = await listWikiPages();
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe("test-article");
    expect(entries[0].title).toBe("Test Article");
    expect(entries[0].summary).toBe("This is the content.");
  });

  it("updates existing entry on re-ingest instead of duplicating", async () => {
    // First ingest
    await ingest("My Topic", "Original content about the topic. More details.");

    let entries = await listWikiPages();
    expect(entries).toHaveLength(1);
    expect(entries[0].summary).toBe("Original content about the topic.");

    // Re-ingest with updated content
    await ingest("My Topic", "Updated content about the topic. New information.");

    entries = await listWikiPages();
    // Should still be 1 entry, NOT 2
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe("My Topic");
    expect(entries[0].summary).toBe("Updated content about the topic.");
  });

  it("updates title on re-ingest when slug matches but title differs", async () => {
    // The slug for both is "hello-world"
    await ingest("Hello World", "First version of the doc. Details here.");

    let entries = await listWikiPages();
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe("Hello World");

    // Same slug, different title text (slug normalizes the same)
    await ingest("Hello  World", "Second version of the doc. Different details.");

    entries = await listWikiPages();
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe("Hello  World");
    expect(entries[0].summary).toBe("Second version of the doc.");
  });

  it("uses extractSummary for index entries (not bare period split)", async () => {
    await ingest("Dr Smith Bio", "Dr. Smith earned his Ph.D. in 2001. He then joined MIT.");

    const entries = await listWikiPages();
    expect(entries).toHaveLength(1);
    // Old code would produce "Dr" from bare period split.
    // New code produces "Dr." (period + space boundary) — still short but includes punctuation.
    expect(entries[0].summary).not.toBe("Dr");
    expect(entries[0].summary.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// isUrl
// ---------------------------------------------------------------------------

describe("isUrl", () => {
  it("recognizes http URLs", () => {
    expect(isUrl("http://example.com")).toBe(true);
  });

  it("recognizes https URLs", () => {
    expect(isUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(isUrl("just some text")).toBe(false);
  });

  it("rejects titles that contain URLs", () => {
    expect(isUrl("My article about https")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isUrl("")).toBe(false);
  });

  it("handles URLs with leading whitespace", () => {
    expect(isUrl("  https://example.com")).toBe(true);
  });

  it("rejects ftp URLs", () => {
    expect(isUrl("ftp://files.example.com")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// stripHtml & extractTitle
// ---------------------------------------------------------------------------

describe("stripHtml", () => {
  it("removes basic HTML tags and preserves text", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("removes script tags and their contents", () => {
    const html = '<p>Before</p><script>var x = 1;</script><p>After</p>';
    expect(stripHtml(html)).toBe("Before After");
  });

  it("removes style tags and their contents", () => {
    const html = '<style>.foo { color: red; }</style><p>Content</p>';
    expect(stripHtml(html)).toBe("Content");
  });

  it("removes nav, header, footer elements", () => {
    const html = '<nav><a href="/">Home</a></nav><main><p>Article text</p></main><footer>Copyright</footer>';
    expect(stripHtml(html)).toBe("Article text");
  });

  it("removes noscript elements", () => {
    const html = '<noscript>Please enable JS</noscript><p>Real content</p>';
    expect(stripHtml(html)).toBe("Real content");
  });

  it("decodes common HTML entities", () => {
    expect(stripHtml("&amp; &lt; &gt; &quot; &#39; &nbsp;")).toBe('& < > " \'');
  });

  it("collapses whitespace", () => {
    expect(stripHtml("<p>  Hello   world  </p>")).toBe("Hello world");
  });

  it("handles multiline script tags", () => {
    const html = `<script type="text/javascript">
      function foo() {
        return "bar";
      }
    </script><p>Content here</p>`;
    expect(stripHtml(html)).toBe("Content here");
  });
});

describe("extractTitle", () => {
  it("extracts title from HTML", () => {
    const html = '<html><head><title>My Page Title</title></head><body></body></html>';
    expect(extractTitle(html)).toBe("My Page Title");
  });

  it("returns empty string when no title tag", () => {
    const html = '<html><head></head><body><p>content</p></body></html>';
    expect(extractTitle(html)).toBe("");
  });

  it("handles title with extra whitespace", () => {
    const html = '<title>  Spaced   Title  </title>';
    expect(extractTitle(html)).toBe("Spaced Title");
  });
});

// ---------------------------------------------------------------------------
// fetchUrlContent (mocked fetch)
// ---------------------------------------------------------------------------

describe("fetchUrlContent", () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
    <head><title>Test Article</title></head>
    <body>
      <nav><a href="/">Home</a><a href="/about">About</a></nav>
      <header><h1>Site Header</h1></header>
      <main>
        <h1>Test Article</h1>
        <p>This is the main article content. It has multiple sentences.</p>
        <p>Second paragraph with more information.</p>
      </main>
      <footer><p>Copyright 2024</p></footer>
      <script>console.log("tracking");</script>
    </body>
    </html>
  `;

  it("extracts title and content from HTML", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(sampleHtml),
    });

    try {
      const result = await fetchUrlContent("https://example.com/article");
      expect(result.title).toBe("Test Article");
      expect(result.content).toContain("main article content");
      expect(result.content).toContain("Second paragraph");
      // Nav, header, footer, script content should be stripped
      expect(result.content).not.toContain("Site Header");
      expect(result.content).not.toContain("Copyright 2024");
      expect(result.content).not.toContain("tracking");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("falls back to hostname when no title tag", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<html><body><p>Some content</p></body></html>"),
    });

    try {
      const result = await fetchUrlContent("https://example.com/page");
      expect(result.title).toBe("example.com");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("throws on HTTP error", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    try {
      await expect(fetchUrlContent("https://example.com/missing")).rejects.toThrow(
        "Failed to fetch URL: 404 Not Found",
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});

// ---------------------------------------------------------------------------
// ingestUrl (integration with mocked fetch, no LLM key)
// ---------------------------------------------------------------------------

describe("ingestUrl", () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
    <head><title>Web Article</title></head>
    <body>
      <main>
        <p>This is a web article about AI. It covers many topics.</p>
      </main>
    </body>
    </html>
  `;

  it("fetches URL and creates wiki page", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(sampleHtml),
    });

    try {
      const result = await ingestUrl("https://example.com/ai-article");
      expect(result.wikiPages).toContain("web-article");
      expect(result.indexUpdated).toBe(true);

      const entries = await listWikiPages();
      const entry = entries.find((e) => e.slug === "web-article");
      expect(entry).toBeDefined();
      expect(entry!.title).toBe("Web Article");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
