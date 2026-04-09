Title: Update stale SCHEMA.md known-gaps section
Files: SCHEMA.md
Issue: none

## Description

SCHEMA.md's "Known gaps" section lists 6 items, but at least 3 are now resolved and shouldn't remain listed. This matters more now that SCHEMA.md is loaded into LLM prompts at runtime — stale known-gaps could confuse the LLM into thinking features don't exist. Also, the "Provider configuration" section is missing Google and Ollama which were added in the 2026-04-09 01:29 session.

### Current Known Gaps (from SCHEMA.md)

1. ~~"No YAML frontmatter on wiki pages"~~ — **RESOLVED** in 2026-04-08 01:50 session. `serializeFrontmatter()` writes title, slug, sources, created/updated, tags.
2. "No image or asset handling on URL ingest" — **Still a gap.** Keep.
3. "No vector search" — **Still a gap.** Keep (BM25 was added but vector search is still absent).
4. ~~"No raw-source browsing UI"~~ — **RESOLVED** in 2026-04-09 01:29 session. `/raw` and `/raw/[slug]` routes exist.
5. ~~"Schema is not yet wired into runtime system prompts"~~ — **PARTIALLY RESOLVED** for ingest in 2026-04-09 05:52, and will be fully resolved by task_01 of this session. Update to say "wired into ingest, query, and lint" or remove entirely if task_01 lands first.
6. "No human-in-the-loop diff review on ingest" — **Still a gap.** Keep.

### Steps

1. **Remove resolved items** — Delete the bullets for frontmatter, raw-source browsing, and schema-in-prompts (mark the last one as resolved assuming task_01 lands).

2. **Add new known gaps** that are documented in the assessment but not in SCHEMA.md:
   - No streaming LLM responses (all calls block)
   - No context window management / token counting
   - No concurrency safety / file locking
   - BM25 scores title+summary only, not page body content

3. **Update Provider configuration** section — Add Google Generative AI (`GOOGLE_GENERATIVE_AI_API_KEY`) and Ollama (`OLLAMA_BASE_URL` / `OLLAMA_MODEL`) to the documented providers. Update the precedence description to match `getModel()` in llm.ts: Anthropic > OpenAI > Google > Ollama.

4. **Update `findRelatedPages` reference** — The cross-reference policy says `findRelatedPages()` is in `src/lib/ingest.ts` but it's actually in `src/lib/wiki.ts`. Fix the reference.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

No code changes, so tests should remain green. Verify no markdown lint issues by visual inspection.
