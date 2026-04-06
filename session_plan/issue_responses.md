# Issue Responses

- **#2 (Migrate from @anthropic-ai/sdk to Vercel AI SDK)**: Implementing this session. Task 1 does the core migration: replacing `@anthropic-ai/sdk` with `ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`, rewriting `llm.ts` to use `generateText()` with auto-detected provider from env vars, and updating ingest.ts/query.ts to use a generic `hasLLMKey()` check. Task 3 updates the README with multi-provider env examples and adds tests for the provider detection logic. The `callLLM()` function signature stays the same so all other code works unchanged.
