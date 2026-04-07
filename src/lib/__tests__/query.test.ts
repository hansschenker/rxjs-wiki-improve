import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { searchIndex, buildContext, query, saveAnswerToWiki } from "../query";
import { writeWikiPage, updateIndex, ensureDirectories, readWikiPage, listWikiPages } from "../wiki";
import type { IndexEntry } from "../types";

// ---------------------------------------------------------------------------
// Mock callLLM and hasLLMKey so tests don't require real API keys
// ---------------------------------------------------------------------------
vi.mock("../llm", () => ({
  hasLLMKey: vi.fn(() => false),
  callLLM: vi.fn(async () => "mocked response"),
}));

import { hasLLMKey, callLLM } from "../llm";

const mockedHasLLMKey = vi.mocked(hasLLMKey);
const mockedCallLLM = vi.mocked(callLLM);

// ---------------------------------------------------------------------------
// Temp directory setup (same pattern as other test files)
// ---------------------------------------------------------------------------
let tmpDir: string;
let originalWikiDir: string | undefined;
let originalRawDir: string | undefined;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "query-test-"));
  originalWikiDir = process.env.WIKI_DIR;
  originalRawDir = process.env.RAW_DIR;
  process.env.WIKI_DIR = path.join(tmpDir, "wiki");
  process.env.RAW_DIR = path.join(tmpDir, "raw");

  // Reset mocks
  mockedHasLLMKey.mockReturnValue(false);
  mockedCallLLM.mockReset();
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

// ---------------------------------------------------------------------------
// searchIndex tests
// ---------------------------------------------------------------------------
describe("searchIndex", () => {
  it("returns matching slugs when question keywords match index entries", async () => {
    const entries: IndexEntry[] = [
      { slug: "machine-learning", title: "Machine Learning", summary: "Overview of ML algorithms" },
      { slug: "cooking", title: "Cooking Tips", summary: "How to cook pasta" },
      { slug: "neural-networks", title: "Neural Networks", summary: "Deep learning neural network architectures" },
    ];

    const result = await searchIndex("What are neural network architectures?", entries);

    expect(result).toContain("neural-networks");
    // "machine-learning" may or may not match depending on token overlap
    expect(result).not.toContain("cooking");
  });

  it("returns empty array when nothing matches", async () => {
    const entries: IndexEntry[] = [
      { slug: "cooking", title: "Cooking Tips", summary: "How to cook pasta" },
      { slug: "gardening", title: "Gardening", summary: "Growing vegetables in your backyard" },
    ];

    const result = await searchIndex("quantum physics equations", entries);

    expect(result).toEqual([]);
  });

  it("handles empty index", async () => {
    const result = await searchIndex("anything at all", []);
    expect(result).toEqual([]);
  });

  it("with no LLM key, falls back to keyword matching", async () => {
    mockedHasLLMKey.mockReturnValue(false);

    const entries: IndexEntry[] = [
      { slug: "python", title: "Python", summary: "Python programming language" },
      { slug: "rust", title: "Rust", summary: "Rust systems programming language" },
    ];

    const result = await searchIndex("Tell me about Python programming", entries);

    expect(result).toContain("python");
    // callLLM should not have been called
    expect(mockedCallLLM).not.toHaveBeenCalled();
  });

  it("uses LLM when available and parses JSON response", async () => {
    mockedHasLLMKey.mockReturnValue(true);
    mockedCallLLM.mockResolvedValue('["neural-networks", "deep-learning"]');

    const entries: IndexEntry[] = [
      { slug: "neural-networks", title: "Neural Networks", summary: "NN overview" },
      { slug: "deep-learning", title: "Deep Learning", summary: "DL overview" },
      { slug: "cooking", title: "Cooking", summary: "Food preparation" },
    ];

    const result = await searchIndex("How do neural networks learn?", entries);

    expect(result).toEqual(["neural-networks", "deep-learning"]);
    expect(mockedCallLLM).toHaveBeenCalledOnce();
  });

  it("falls back to keywords when LLM returns invalid JSON", async () => {
    mockedHasLLMKey.mockReturnValue(true);
    mockedCallLLM.mockResolvedValue("I think you should look at neural networks");

    const entries: IndexEntry[] = [
      { slug: "neural-networks", title: "Neural Networks", summary: "NN architectures overview" },
      { slug: "cooking", title: "Cooking", summary: "Food preparation tips" },
    ];

    const result = await searchIndex("neural network architectures", entries);

    // Should fall back to keyword matching
    expect(result).toContain("neural-networks");
  });

  it("falls back to keywords when LLM call throws", async () => {
    mockedHasLLMKey.mockReturnValue(true);
    mockedCallLLM.mockRejectedValue(new Error("API error"));

    const entries: IndexEntry[] = [
      { slug: "python", title: "Python", summary: "Python programming language" },
    ];

    const result = await searchIndex("Python programming", entries);

    expect(result).toContain("python");
  });

  it("filters out invalid slugs from LLM response", async () => {
    mockedHasLLMKey.mockReturnValue(true);
    mockedCallLLM.mockResolvedValue('["valid-slug", "nonexistent-slug"]');

    const entries: IndexEntry[] = [
      { slug: "valid-slug", title: "Valid", summary: "A valid page" },
    ];

    const result = await searchIndex("test question", entries);

    expect(result).toEqual(["valid-slug"]);
  });

  it("sorts keyword results by score descending", async () => {
    const entries: IndexEntry[] = [
      { slug: "partial", title: "Partial", summary: "About machine systems" },
      { slug: "best-match", title: "Machine Learning", summary: "Machine learning algorithms and systems" },
    ];

    const result = await searchIndex("machine learning systems", entries);

    // "best-match" should rank higher (more keyword hits)
    expect(result[0]).toBe("best-match");
  });
});

// ---------------------------------------------------------------------------
// buildContext tests
// ---------------------------------------------------------------------------
describe("buildContext", () => {
  it("returns empty context when no slugs provided", async () => {
    const result = await buildContext();
    expect(result.context).toBe("");
    expect(result.slugs).toEqual([]);
  });

  it("returns empty context when empty slug array provided", async () => {
    const result = await buildContext([]);
    expect(result.context).toBe("");
    expect(result.slugs).toEqual([]);
  });

  it("loads only specified pages", async () => {
    await writeWikiPage("alpha", "# Alpha\n\nAlpha content here.");
    await writeWikiPage("beta", "# Beta\n\nBeta content here.");
    await writeWikiPage("gamma", "# Gamma\n\nGamma content here.");

    const result = await buildContext(["alpha", "gamma"]);

    expect(result.slugs).toEqual(["alpha", "gamma"]);
    expect(result.context).toContain("Alpha content");
    expect(result.context).toContain("Gamma content");
    expect(result.context).not.toContain("Beta content");
  });

  it("skips pages that don't exist on disk", async () => {
    await writeWikiPage("exists", "# Exists\n\nReal content.");

    const result = await buildContext(["exists", "ghost"]);

    expect(result.slugs).toEqual(["exists"]);
    expect(result.context).toContain("Real content");
  });
});

// ---------------------------------------------------------------------------
// query() integration tests
// ---------------------------------------------------------------------------
describe("query", () => {
  it("returns empty-wiki message when no pages exist", async () => {
    await ensureDirectories();

    const result = await query("What is anything?");

    expect(result.answer).toContain("wiki is empty");
    expect(result.answer).toContain("ingest");
    expect(result.sources).toEqual([]);
  });

  it("returns no-api-key message when no key configured", async () => {
    mockedHasLLMKey.mockReturnValue(false);

    // Create a small wiki (<=5 pages)
    await writeWikiPage("page-one", "# Page One\n\nSome content.");
    await updateIndex([
      { slug: "page-one", title: "Page One", summary: "First page" },
    ]);

    const result = await query("What is page one?");

    expect(result.answer).toContain("No API key configured");
    expect(result.answer).toContain("page-one");
    expect(result.sources).toEqual([]);
  });

  it("loads all pages for small wikis (<= 5 pages)", async () => {
    mockedHasLLMKey.mockReturnValue(true);
    mockedCallLLM.mockResolvedValue("Answer citing [Alpha](alpha.md)");

    await writeWikiPage("alpha", "# Alpha\n\nAlpha content.");
    await writeWikiPage("beta", "# Beta\n\nBeta content.");
    await updateIndex([
      { slug: "alpha", title: "Alpha", summary: "Alpha page" },
      { slug: "beta", title: "Beta", summary: "Beta page" },
    ]);

    const result = await query("Tell me about alpha");

    expect(result.answer).toContain("Alpha");
    expect(result.sources).toContain("alpha");

    // The system prompt sent to callLLM should contain both pages
    const systemPrompt = mockedCallLLM.mock.calls[0][0];
    expect(systemPrompt).toContain("Alpha content");
    expect(systemPrompt).toContain("Beta content");
  });

  it("uses searchIndex for large wikis (> 5 pages)", async () => {
    mockedHasLLMKey.mockReturnValue(true);

    // First call is searchIndex, second is the actual query
    mockedCallLLM
      .mockResolvedValueOnce('["target-page"]')
      .mockResolvedValueOnce("Here is the answer about [Target](target-page.md)");

    const entries: IndexEntry[] = [];
    for (let i = 1; i <= 7; i++) {
      const slug = i === 4 ? "target-page" : `page-${i}`;
      const title = i === 4 ? "Target Page" : `Page ${i}`;
      const summary = i === 4 ? "The target topic we want" : `Content for page ${i}`;
      await writeWikiPage(slug, `# ${title}\n\n${summary} with details.`);
      entries.push({ slug, title, summary });
    }
    await updateIndex(entries);

    const result = await query("Tell me about the target topic");

    // Should have called LLM twice: once for index search, once for answer
    expect(mockedCallLLM).toHaveBeenCalledTimes(2);
    expect(result.sources).toContain("target-page");

    // The query prompt should only load target-page's full content, not all pages
    const queryPrompt = mockedCallLLM.mock.calls[1][0];
    expect(queryPrompt).toContain("The target topic we want with details.");
    // page-1's full page content should NOT be loaded (only its index listing)
    expect(queryPrompt).not.toContain("=== Page: Page 1");
  });

  it("includes full index listing in system prompt for large wikis", async () => {
    mockedHasLLMKey.mockReturnValue(true);

    mockedCallLLM
      .mockResolvedValueOnce('["page-1"]')
      .mockResolvedValueOnce("The answer");

    const entries: IndexEntry[] = [];
    for (let i = 1; i <= 6; i++) {
      const slug = `page-${i}`;
      const title = `Page ${i}`;
      await writeWikiPage(slug, `# ${title}\n\nContent for page ${i}.`);
      entries.push({ slug, title, summary: `Summary ${i}` });
    }
    await updateIndex(entries);

    await query("question about page 1");

    // The system prompt for the final query should mention other pages
    const systemPrompt = mockedCallLLM.mock.calls[1][0];
    expect(systemPrompt).toContain("other pages");
  });
});

// ---------------------------------------------------------------------------
// saveAnswerToWiki tests
// ---------------------------------------------------------------------------
describe("saveAnswerToWiki", () => {
  it("saves an answer as a wiki page and updates the index", async () => {
    await ensureDirectories();

    const result = await saveAnswerToWiki(
      "Neural Networks Explained",
      "Neural networks are computational models. They consist of layers of neurons.",
    );

    expect(result.slug).toBe("neural-networks-explained");

    // Verify the wiki page was created
    const page = await readWikiPage("neural-networks-explained");
    expect(page).not.toBeNull();
    expect(page!.content).toContain("# Neural Networks Explained");
    expect(page!.content).toContain("Neural networks are computational models");

    // Verify the index was updated
    const entries = await listWikiPages();
    const entry = entries.find((e) => e.slug === "neural-networks-explained");
    expect(entry).toBeDefined();
    expect(entry!.title).toBe("Neural Networks Explained");
    expect(entry!.summary).toContain("Neural networks are computational models");
  });

  it("does not duplicate heading if content already starts with one", async () => {
    await ensureDirectories();

    await saveAnswerToWiki(
      "My Topic",
      "# My Topic\n\nAlready has a heading.",
    );

    const page = await readWikiPage("my-topic");
    expect(page).not.toBeNull();
    // Should not have double heading
    const headingCount = (page!.content.match(/^# /gm) || []).length;
    expect(headingCount).toBe(1);
  });

  it("updates existing index entry on re-save", async () => {
    await ensureDirectories();

    await saveAnswerToWiki("First Version", "Original content.");
    await saveAnswerToWiki("First Version", "Updated content.");

    const entries = await listWikiPages();
    const matching = entries.filter((e) => e.slug === "first-version");
    expect(matching).toHaveLength(1);

    const page = await readWikiPage("first-version");
    expect(page!.content).toContain("Updated content");
  });

  it("throws when title produces an empty slug", async () => {
    await ensureDirectories();

    await expect(saveAnswerToWiki("!!!", "Some content")).rejects.toThrow(
      "valid slug",
    );
  });

  it("cross-references related pages after saving", async () => {
    mockedHasLLMKey.mockReturnValue(true);
    // findRelatedPages will call the LLM and expect a JSON array of slugs
    mockedCallLLM.mockResolvedValue('["react", "nextjs"]');

    // Seed the wiki with two existing pages
    await writeWikiPage(
      "react",
      "# React\n\nReact is a JavaScript framework for building user interfaces.",
    );
    await writeWikiPage(
      "nextjs",
      "# Next.js\n\nNext.js is a JavaScript framework built on top of React.",
    );
    await updateIndex([
      { slug: "react", title: "React", summary: "JavaScript UI framework" },
      { slug: "nextjs", title: "Next.js", summary: "JavaScript framework on React" },
    ]);

    await saveAnswerToWiki(
      "JavaScript Frameworks Overview",
      "Modern JavaScript frameworks like React and Next.js have transformed web development.",
    );

    // The new page should exist
    const newPage = await readWikiPage("javascript-frameworks-overview");
    expect(newPage).not.toBeNull();

    // At least one of the seeded pages should now link back to the new slug
    const reactPage = await readWikiPage("react");
    const nextPage = await readWikiPage("nextjs");
    const reactLinks = reactPage!.content.includes(
      "javascript-frameworks-overview.md",
    );
    const nextLinks = nextPage!.content.includes(
      "javascript-frameworks-overview.md",
    );
    expect(reactLinks || nextLinks).toBe(true);
  });
});
