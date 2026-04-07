import { callLLM, hasLLMKey } from "./llm";
import {
  listWikiPages,
  readWikiPage,
  writeWikiPageWithSideEffects,
} from "./wiki";
import { slugify } from "./ingest";
import type { IndexEntry, QueryResult } from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of pages to include in context for large wikis. */
const MAX_CONTEXT_PAGES = 10;

/** If the wiki has this many or fewer pages, load all of them (no filtering). */
const SMALL_WIKI_THRESHOLD = 5;

/** Stop words to exclude when tokenizing a question for keyword matching. */
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "what", "how", "which", "does", "do", "did", "has", "have", "had",
  "who", "whom", "whose", "where", "when", "why",
  "can", "could", "would", "should", "will", "shall", "may", "might",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "and", "or", "but", "not", "no", "nor", "so", "if", "then", "than",
  "this", "that", "these", "those", "it", "its",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "they", "them",
  "tell", "explain", "describe", "give", "show",
]);

const SYSTEM_PROMPT_TEMPLATE = `You are a wiki assistant. Answer the user's question using ONLY the wiki pages provided below.

Rules:
- Base your answer strictly on the wiki content provided
- Cite your sources using markdown links: [Page Title](slug.md)
- If the wiki doesn't contain enough information to answer, say so clearly
- Format your answer in markdown
{index_section}
Wiki pages:
{context}`;

const INDEX_SELECTION_PROMPT = `You are a wiki search assistant. Given a user's question and a wiki index, return the slugs of the most relevant pages to answer the question.

Return ONLY a JSON array of slug strings, no other text. Maximum 10 slugs, ordered by relevance.

Example response:
["machine-learning", "neural-networks", "backpropagation"]

Wiki index:
{index}`;

// ---------------------------------------------------------------------------
// Keyword-based index search
// ---------------------------------------------------------------------------

/**
 * Tokenize a string into lowercase words, filtering out stop words and
 * very short tokens.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/**
 * Score an index entry by how many question keywords appear in its title
 * and summary (case-insensitive).
 */
function scoreEntry(entry: IndexEntry, questionTokens: string[]): number {
  const entryText = `${entry.title} ${entry.summary}`.toLowerCase();
  let score = 0;
  for (const token of questionTokens) {
    if (entryText.includes(token)) {
      score++;
    }
  }
  return score;
}

/**
 * Search the wiki index to find the most relevant page slugs for a question.
 *
 * Phase 1: keyword matching (always runs)
 * Phase 2: LLM-based selection (if available, overrides keyword results)
 *
 * Falls back to keyword results if LLM call fails.
 */
export async function searchIndex(
  question: string,
  entries: IndexEntry[],
): Promise<string[]> {
  if (entries.length === 0) {
    return [];
  }

  // Phase 1 — keyword matching
  const questionTokens = tokenize(question);

  const scored = entries
    .map((entry) => ({
      slug: entry.slug,
      score: scoreEntry(entry, questionTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_PAGES);

  const keywordSlugs = scored.map((item) => item.slug);

  // Phase 2 — LLM-based selection (if available)
  if (hasLLMKey()) {
    try {
      const indexText = entries
        .map((e) => `- [${e.title}](${e.slug}.md) — ${e.summary}`)
        .join("\n");

      const prompt = INDEX_SELECTION_PROMPT.replace("{index}", indexText);
      const response = await callLLM(prompt, question);

      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as unknown;
        if (Array.isArray(parsed)) {
          const validSlugs = new Set(entries.map((e) => e.slug));
          const llmSlugs = parsed
            .filter((s): s is string => typeof s === "string" && validSlugs.has(s))
            .slice(0, MAX_CONTEXT_PAGES);

          if (llmSlugs.length > 0) {
            return llmSlugs;
          }
        }
      }
    } catch {
      // Fall through to keyword results
    }
  }

  return keywordSlugs;
}

// ---------------------------------------------------------------------------
// Context building
// ---------------------------------------------------------------------------

/**
 * Build a context string from wiki pages.
 *
 * When `slugs` is provided, only those pages are loaded.
 * When omitted or empty, returns empty context.
 */
export async function buildContext(slugs?: string[]): Promise<{
  context: string;
  slugs: string[];
}> {
  if (!slugs || slugs.length === 0) {
    return { context: "", slugs: [] };
  }

  const loadedSlugs: string[] = [];
  const parts: string[] = [];

  for (const slug of slugs) {
    const page = await readWikiPage(slug);
    if (page) {
      loadedSlugs.push(page.slug);
      parts.push(
        `=== Page: ${page.title} (slug: ${page.slug}) ===\n${page.content}`,
      );
    }
  }

  return { context: parts.join("\n\n"), slugs: loadedSlugs };
}

// ---------------------------------------------------------------------------
// Citation extraction
// ---------------------------------------------------------------------------

/**
 * Extract cited wiki slugs from the LLM response.
 * Scans for markdown link patterns like `](slug.md)`.
 */
function extractCitedSlugs(
  answer: string,
  availableSlugs: string[],
): string[] {
  const pattern = /\]\(([^)]+?)\.md\)/g;
  const cited = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(answer)) !== null) {
    const slug = match[1];
    if (availableSlugs.includes(slug)) {
      cited.add(slug);
    }
  }

  return Array.from(cited);
}

// ---------------------------------------------------------------------------
// Main query function
// ---------------------------------------------------------------------------

/**
 * Query the wiki with a user question.
 *
 * Index-first approach: reads the index to find relevant pages, then loads
 * only those pages for context. For small wikis (<= 5 pages), loads all.
 */
export async function query(question: string): Promise<QueryResult> {
  const entries = await listWikiPages();

  // Empty wiki — nothing to query
  if (entries.length === 0) {
    return {
      answer:
        "The wiki is empty. Please [ingest some content](/ingest) first so I have something to answer from.",
      sources: [],
    };
  }

  // Determine which pages to load
  let selectedSlugs: string[];

  if (entries.length <= SMALL_WIKI_THRESHOLD) {
    // Small wiki — load all pages
    selectedSlugs = entries.map((e) => e.slug);
  } else {
    // Large wiki — search index for relevant pages
    selectedSlugs = await searchIndex(question, entries);

    // If no matches found, fall back to first N pages
    if (selectedSlugs.length === 0) {
      selectedSlugs = entries.slice(0, MAX_CONTEXT_PAGES).map((e) => e.slug);
    }
  }

  const { context } = await buildContext(selectedSlugs);

  // No API key — return a helpful fallback
  if (!hasLLMKey()) {
    const allSlugs = entries.map((e) => e.slug);
    const pageList = allSlugs.map((s) => `- ${s}`).join("\n");
    return {
      answer: `**No API key configured.** Set an API key (\`ANTHROPIC_API_KEY\`, \`OPENAI_API_KEY\`, etc.) to enable querying.\n\nYour wiki currently contains these pages:\n${pageList}`,
      sources: [],
    };
  }

  // Build the full index listing so the LLM knows what else exists
  const indexListing = entries
    .map((e) => `- [${e.title}](${e.slug}.md) — ${e.summary}`)
    .join("\n");

  const indexSection =
    entries.length > selectedSlugs.length
      ? `\nThe wiki also contains these other pages (not loaded in full):\n${indexListing}\n`
      : "";

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{context}", context)
    .replace("{index_section}", indexSection);

  const answer = await callLLM(systemPrompt, question);

  // All slugs in the wiki are valid citation targets
  const allSlugs = entries.map((e) => e.slug);
  const sources = extractCitedSlugs(answer, allSlugs);

  return { answer, sources };
}

// ---------------------------------------------------------------------------
// Save answer to wiki
// ---------------------------------------------------------------------------

/**
 * Save a query answer as a new wiki page.
 *
 * Unlike the full `ingest()` pipeline, this writes the answer markdown
 * directly — it's already a well-formatted page with citations. The actual
 * write/index/cross-ref/log dance is delegated to
 * {@link writeWikiPageWithSideEffects} so this path can never drift from
 * `ingest()` again (see `.yoyo/learnings.md` — "Parallel write-paths drift").
 *
 * Returns the slug of the newly created wiki page.
 */
export async function saveAnswerToWiki(
  title: string,
  content: string,
): Promise<{ slug: string }> {
  const slug = slugify(title);

  if (!slug) {
    throw new Error("Title must produce a valid slug");
  }

  // Prepend a heading if the content doesn't already start with one
  const pageContent = content.trimStart().startsWith("# ")
    ? content
    : `# ${title}\n\n${content}`;

  // Extract a short summary from the content (first sentence or first 200 chars)
  const plainContent = content.replace(/^#.*$/gm, "").trim();
  const sentenceEnd = plainContent.search(/[.!?]\s/);
  const summaryText =
    sentenceEnd !== -1 && sentenceEnd < 200
      ? plainContent.slice(0, sentenceEnd + 1)
      : plainContent.slice(0, 200);
  const summary = summaryText.replace(/\s+/g, " ").trim() || title;

  // Hand off to the unified write pipeline. We pass the original answer
  // `content` (rather than `pageContent`) as the cross-ref source so the
  // related-pages prompt sees the same text the user actually saw.
  const { slug: writtenSlug } = await writeWikiPageWithSideEffects({
    slug,
    title,
    content: pageContent,
    summary,
    logOp: "save",
    crossRefSource: content,
    logDetails: ({ updatedSlugs }) =>
      `query answer saved as ${slug} · linked ${updatedSlugs.length} related page(s)`,
  });

  return { slug: writtenSlug };
}
