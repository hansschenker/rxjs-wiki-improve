Title: Update README env config docs and add LLM provider test
Files: README.md, src/lib/__tests__/llm.test.ts
Issue: #2

## What

Now that task_01 migrated to Vercel AI SDK, update the README's local dev instructions to reflect multi-provider support, and add a unit test for the LLM provider detection logic.

## Steps

1. **Update `README.md`** — In the "Run It Locally" section:
   - Update the `.env.local` example to show all supported providers clearly:
     ```
     # Pick ONE provider — set the API key for whichever you want to use:
     ANTHROPIC_API_KEY=sk-ant-...     # Anthropic Claude (default)
     # OPENAI_API_KEY=sk-...          # OpenAI GPT
     
     # Optional: override the default model
     # LLM_MODEL=claude-sonnet-4-20250514
     ```
   - Keep it concise, don't over-explain

2. **Add `src/lib/__tests__/llm.test.ts`**:
   - Test `hasLLMKey()` returns true/false based on env vars
   - Test that `callLLM()` throws a clear error when no API key is set (temporarily clear all key env vars)
   - Use `beforeEach`/`afterEach` to save/restore env vars like wiki.test.ts does
   - Don't test actual LLM calls (no API keys in CI)

3. **Verify**: `pnpm build && pnpm lint && pnpm test`

## Key constraints
- This task depends on task_01 being completed first (needs the hasLLMKey export)
- Don't modify llm.ts — just test it and update docs
- Keep README changes minimal and focused on the env config section
