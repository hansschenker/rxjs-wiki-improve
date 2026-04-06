import {
  saveRawSource,
  writeWikiPage,
  listWikiPages,
  updateIndex,
  appendToLog,
} from "./wiki";
import { callLLM, hasLLMKey } from "./llm";
import type { IngestResult } from "./types";

// ---------------------------------------------------------------------------
// Slug generation
// ---------------------------------------------------------------------------

/** Convert a title into a URL-safe slug (lowercase, hyphens, no special chars). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    .replace(/&nbsp;/g, " ");

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
 * Fetch a URL and extract its text content and title.
 *
 * Uses Node.js native `fetch()` and regex-based HTML stripping.
 */
export async function fetchUrlContent(
  url: string,
): Promise<{ title: string; content: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "llm-wiki/1.0",
      Accept: "text/html,application/xhtml+xml,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch URL: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();

  const title = extractTitle(html) || new URL(url).hostname;
  const content = stripHtml(html);

  if (!content) {
    throw new Error("No text content could be extracted from the URL");
  }

  return { title, content };
}

/**
 * Ingest a URL into the wiki.
 *
 * 1. Fetch and extract the page content
 * 2. Delegate to the standard `ingest()` pipeline
 */
export async function ingestUrl(url: string): Promise<IngestResult> {
  const { title, content } = await fetchUrlContent(url);
  return ingest(title, content);
}

// ---------------------------------------------------------------------------
// Fallback stub (no API key)
// ---------------------------------------------------------------------------

function generateFallbackPage(title: string, content: string): string {
  const preview = content.length > 200 ? content.slice(0, 200) + "..." : content;
  return `# ${title}\n\n## Summary\n\n${preview}\n\n## Raw Content\n\n${content}`;
}

// ---------------------------------------------------------------------------
// Summary extraction
// ---------------------------------------------------------------------------

/**
 * Extract a short summary from content by finding the first sentence.
 *
 * Uses sentence-ending punctuation followed by whitespace (`[.!?]\s`) or
 * paragraph breaks (`\n\n`) as boundaries — avoids splitting on abbreviations
 * like "Dr." or "U.S." where the period is not followed by a space that starts
 * a new sentence (though it's a heuristic, not perfect).
 *
 * Returns at most `maxLen` characters.
 */
export function extractSummary(content: string, maxLen = 200): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  // Look for a sentence boundary: period/exclamation/question followed by a space
  const sentenceEnd = trimmed.search(/[.!?]\s/);
  // Look for a paragraph break
  const paraBreak = trimmed.indexOf("\n\n");

  // Pick the earliest valid boundary
  let cutoff = -1;
  if (sentenceEnd !== -1 && paraBreak !== -1) {
    cutoff = Math.min(sentenceEnd + 1, paraBreak); // +1 to include the punctuation
  } else if (sentenceEnd !== -1) {
    cutoff = sentenceEnd + 1;
  } else if (paraBreak !== -1) {
    cutoff = paraBreak;
  }

  let summary: string;
  if (cutoff !== -1 && cutoff <= maxLen) {
    summary = trimmed.slice(0, cutoff).trim();
  } else {
    // No sentence boundary found or it's too far — just truncate
    summary =
      trimmed.length > maxLen
        ? trimmed.slice(0, maxLen).trim() + "..."
        : trimmed.trim();
  }

  return summary;
}

// ---------------------------------------------------------------------------
// Ingest pipeline
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a wiki editor. Given a source document, generate a wiki article in markdown format.

Include:
- A title as a level-1 heading (# Title)
- A brief summary section (## Summary)
- Key points or takeaways (## Key Points)
- Notable entities, concepts, or terms worth remembering (## Concepts)

Output pure markdown and nothing else. Do not wrap in code fences.`;

/**
 * Ingest a source document into the wiki.
 *
 * 1. Generate a slug from the title
 * 2. Save the raw source
 * 3. Generate a wiki page via LLM (or fallback stub)
 * 4. Write the wiki page
 * 5. Update the index (insert or update existing entry)
 * 6. Append to the log
 */
export async function ingest(
  title: string,
  content: string,
): Promise<IngestResult> {
  const slug = slugify(title);

  // 1. Save raw source
  const rawPath = await saveRawSource(slug, content);

  // 2. Generate wiki page content
  let wikiContent: string;
  if (hasLLMKey()) {
    wikiContent = await callLLM(SYSTEM_PROMPT, content);
  } else {
    wikiContent = generateFallbackPage(title, content);
  }

  // 3. Write wiki page
  await writeWikiPage(slug, wikiContent);

  // 4. Update index — insert new entry or update existing one
  const entries = await listWikiPages();
  const summary = extractSummary(content);
  const existingIdx = entries.findIndex((e) => e.slug === slug);
  if (existingIdx !== -1) {
    // Re-ingest: update title and summary of the existing entry
    entries[existingIdx].title = title;
    entries[existingIdx].summary = summary;
  } else {
    entries.push({ title, slug, summary });
  }
  await updateIndex(entries);

  // 5. Log
  await appendToLog(`Ingested "${title}" as ${slug}`);

  return {
    rawPath,
    wikiPages: [slug],
    indexUpdated: true,
  };
}
