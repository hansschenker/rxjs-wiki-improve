Title: Migrate LLM layer from @anthropic-ai/sdk to Vercel AI SDK
Files: package.json, src/lib/llm.ts, src/lib/ingest.ts, src/lib/query.ts
Issue: #2

## What

Replace `@anthropic-ai/sdk` with the Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`) so users can pick their LLM provider at deploy time via environment variables.

## Steps

1. **Install packages**: `pnpm add ai @ai-sdk/anthropic @ai-sdk/openai` and `pnpm remove @anthropic-ai/sdk`

2. **Rewrite `src/lib/llm.ts`**:
   - Use `generateText()` from `ai` package
   - Auto-detect provider from env vars: check for `ANTHROPIC_API_KEY` → use `@ai-sdk/anthropic`, check for `OPENAI_API_KEY` → use `@ai-sdk/openai`. Throw a clear error if no key found.
   - Keep the same `callLLM(systemPrompt: string, userMessage: string): Promise<string>` signature so callers don't change.
   - Support a `LLM_MODEL` env var to override the default model. Default to `claude-sonnet-4-20250514` for Anthropic, `gpt-4o` for OpenAI.

3. **Update `src/lib/ingest.ts`**:
   - Change the API key check from `process.env.ANTHROPIC_API_KEY` to a helper that checks for any supported provider key (e.g., import a `hasLLMKey()` function from llm.ts or just check inline).

4. **Update `src/lib/query.ts`**:
   - Same: change `process.env.ANTHROPIC_API_KEY` check to the multi-provider check.
   - Update the fallback message to say "Set an API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)" instead of Anthropic-specific.

5. **Verify**: `pnpm build && pnpm lint && pnpm test` — all must pass.

## Key constraints

- Keep the `callLLM()` function signature identical so no other files need changes.
- Export a `hasLLMKey()` helper from llm.ts for use by ingest.ts and query.ts.
- Don't change any test files.
- The provider detection should be simple: check env vars in priority order (ANTHROPIC first, then OPENAI).
