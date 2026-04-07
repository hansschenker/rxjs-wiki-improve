Title: Add SCHEMA.md — wiki conventions and operations doc
Files: SCHEMA.md, README.md, src/lib/ingest.ts (light reference only)
Issue: none

# Background

`llm-wiki.md` line 37 (the founding vision) calls out the schema as:

> a document (e.g. CLAUDE.md for Claude Code or AGENTS.md for Codex) that tells the LLM how
> the wiki is structured, what the conventions are, and what workflows to follow when ingesting
> sources, answering questions, or maintaining the wiki. **This is the key configuration file —
> it's what makes the LLM a disciplined wiki maintainer rather than a generic chatbot.**

This is the **biggest gap from the founding vision**. We have system prompts hardcoded in
`ingest.ts`, `query.ts`, `lint.ts`, but no human-and-LLM-readable doc that codifies them. The
journal claims one was added in the 2026-04-06 19:15 session but it's not in the tree (likely lost
in the history graft).

# What to build

## 1. Create `SCHEMA.md` at the repo root

This is a markdown document that any LLM (or any human) can read to understand how the wiki is
structured and how to operate on it. It is NOT loaded by the app at runtime in this task — the
goal is just to put the doc in place. (A future task can wire it into the system prompts.)

Required sections, in this order:

### Header
- Title: `# Wiki Schema`
- One-paragraph preamble explaining what this file is and who it's for. Reference `llm-wiki.md`
  as the founding vision.

### Layers
Three subsections, each one paragraph, mirroring `llm-wiki.md` §Architecture:
- **Raw sources** (`raw/` directory) — immutable, source of truth, gitignored.
- **The wiki** (`wiki/` directory) — LLM-generated markdown, gitignored.
- **The schema** (this file) — co-evolved conventions.

### Page conventions
Concrete rules the LLM should follow when creating wiki pages:
- Filenames are kebab-case slugs ending in `.md`. Slugs match `/^[a-z0-9][a-z0-9-]*$/`.
- Every page starts with an H1 title.
- Every page has a one-paragraph summary right after the H1 (used by the index).
- Cross-references use markdown links of the form `[Title](other-slug.md)` — relative, no
  leading slash, `.md` suffix required so the graph builder can detect them.
- Pages SHOULD link to at least one other page (avoid orphans). Pages SHOULD NOT self-link.
- Two special pages exist:
  - `index.md` — content catalog (one bullet per page, owned by `updateIndex()`).
  - `log.md` — chronological activity log (owned by `appendToLog()`).
- Pages should not be edited by humans — the LLM owns the wiki layer.

### Operations
Document the three core operations and their expected workflow. For each, describe:
- Trigger (what input)
- Steps (what the LLM does, in order)
- Outputs (what files change)
- Log entry shape

#### Ingest
- Trigger: a URL or pasted text + title.
- Steps: fetch/clean → save raw source → write/update wiki page → update index → find related
  pages by entity overlap → cross-reference them → append log entry.
- Outputs: `raw/<slug>.md`, `wiki/<slug>.md`, `wiki/index.md`, possibly multiple related
  `wiki/<other>.md`, `wiki/log.md`.
- Log entry: `## [YYYY-MM-DD] ingest | <Title>`

#### Query
- Trigger: a question.
- Steps: read `index.md` → keyword + LLM rank to find relevant pages → fetch their full content →
  synthesize an answer with citations → return answer + sources. If the user chooses to save,
  the answer becomes a new wiki page.
- Outputs: none on the wiki by default; if saved, `wiki/<slug>.md` + index update + log entry.
- Log entry (on save): `## [YYYY-MM-DD] save | <Title>`

#### Lint
- Trigger: explicit invocation (`/lint`).
- Steps: scan all wiki pages for orphans, stale pages, empty pages, missing cross-references;
  cluster cross-referenced pages and ask the LLM to spot contradictions.
- Outputs: a report (no file mutations).
- Log entry: not currently emitted (note this as a known gap).

### Cross-reference policy
- A "related" page is determined by entity/keyword overlap — see `findRelatedPages()` in
  `src/lib/ingest.ts`.
- When a new page is added, the related-page detector finds candidates and adds a "Related"
  section to each one linking back to the new page.
- Self-links are forbidden.
- Existing cross-refs are preserved (we only append, never rewrite).

### Lint checks
List the current checks (one bullet each). Order: orphan, stale, empty, missing-crossref,
contradictions. For each, one sentence.

### Provider configuration
- The app uses Vercel AI SDK. Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (Anthropic preferred
  if both set). Override the model via `LLM_MODEL`.
- Without an API key, ingest still works (raw save + page write), but query/lint LLM features
  return a "no LLM key configured" notice.

### Known gaps
A short bulleted list of things the schema *doesn't* yet codify, so future sessions know where
to push. Examples (not exhaustive — write what you observe):
- No frontmatter (YAML metadata) on wiki pages.
- No image / asset handling on URL ingest.
- Lint pass does not emit a log entry.
- No vector search; index.md is the only search corpus.
- No raw-source browsing UI.

### Co-evolution
One paragraph explaining that this document is meant to be updated by yoyo as conventions
emerge. Reference `.yoyo/journal.md` for the running history.

## 2. Update `README.md`

Add a single line under whatever "Project files" or "Vision" section exists, pointing readers
at SCHEMA.md as the conventions doc. Do not rewrite the README — one targeted edit only. If
README does not have an obvious section to add to, add a "## Schema" subsection with one line
and a link.

## 3. Add a code reference (optional, lightweight)

In `src/lib/ingest.ts`, find the system-prompt area (the constant or function that builds the
ingest LLM prompt) and add a single comment line pointing at `SCHEMA.md`:

```ts
// Conventions are documented in SCHEMA.md at the repo root.
```

This is a breadcrumb so future sessions know to keep prompt and schema in sync. Do not change
prompt text in this task. **Skip this step entirely if it doesn't fit cleanly in <2 minutes.**

# Verification

```sh
pnpm install   # if needed
pnpm build
pnpm lint
pnpm test
```

Build/lint/test must pass — they will, because this task is doc-only plus an optional comment.
Verify `SCHEMA.md` renders correctly in your terminal pager (no broken markdown).

# Constraints

- Files touched: 2-3 max (SCHEMA.md, README.md, optionally ingest.ts).
- Do NOT modify `llm-wiki.md` — it is immutable per the project rules.
- Do NOT wire SCHEMA.md into runtime prompts in this task (that's a future task).
- Keep SCHEMA.md under ~250 lines. It's a reference doc, not an essay.
- Use specific file paths and function names from the actual codebase, not made-up ones.
