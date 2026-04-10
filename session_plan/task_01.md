Title: Settings config store and API
Files: src/lib/config.ts (new), src/app/api/settings/route.ts (new), src/lib/llm.ts (modify), src/lib/__tests__/config.test.ts (new)
Issue: none

## Description

Create a runtime configuration layer so users can configure their LLM provider through the app instead of editing `.env` files. This is the #1 UX gap — flagged by the journal across 4+ sessions.

### 1. `src/lib/config.ts` — Config store

Create a JSON-based config store that persists to a `.llm-wiki-config.json` file in the project root (or `DATA_DIR` if set). The file stores:

```typescript
interface AppConfig {
  provider?: "anthropic" | "openai" | "google" | "ollama";
  apiKey?: string;
  model?: string;
  ollamaBaseUrl?: string;
  embeddingModel?: string;
}
```

Functions:
- `loadConfig(): Promise<AppConfig>` — reads and parses the config file, returns `{}` if missing
- `saveConfig(config: AppConfig): Promise<void>` — writes JSON atomically
- `getEffectiveProvider(): ProviderInfo` — merges config file settings with env vars (env vars win if both set, so existing deployments aren't broken)

The merge priority: env vars > config file > defaults.

### 2. `src/app/api/settings/route.ts` — GET/PUT API

- `GET /api/settings` — returns the current effective config (provider, model, whether configured) + which source each setting came from (env vs config file). **Never returns the full API key** — return a masked version like `sk-...abc123`.
- `PUT /api/settings` — accepts a JSON body with `AppConfig` fields, validates them, writes to the config file via `saveConfig()`. Returns the new effective provider info.

### 3. Update `src/lib/llm.ts`

Modify `hasLLMKey()`, `getProviderInfo()`, and `getModel()` to check the config store as a fallback when env vars aren't set. Use synchronous file reads (via `fs.readFileSync`) with try/catch for the hot path since these are called frequently and the file is tiny. Cache the parsed config in memory with a short TTL (5s) to avoid constant disk reads.

### 4. `src/lib/__tests__/config.test.ts` — Tests

- Test `loadConfig` with missing file returns `{}`
- Test `saveConfig` + `loadConfig` round-trip
- Test merge priority (env wins over config file)
- Test masked key output
- Test invalid provider name rejection

### Verification
```
pnpm build && pnpm lint && pnpm test
```
