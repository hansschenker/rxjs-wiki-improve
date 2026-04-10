Title: Consolidate provider/model constants into single source of truth
Files: src/lib/config.ts, src/app/settings/page.tsx
Issue: none

## Description

The assessment identified provider/model constants duplicated in 3 places, which will drift:
- `config.ts`: `VALID_PROVIDERS` Set, `DEFAULT_MODELS` record
- `settings/page.tsx`: `PROVIDERS` array (with labels), `DEFAULT_MODELS` record (duplicate!), `providerLabel` function

### Changes to `src/lib/config.ts`

1. Export `DEFAULT_MODELS` (currently module-private `const`). Just add `export` keyword.

2. Export a `PROVIDER_INFO` constant that combines provider values with labels:
```ts
export const PROVIDER_INFO = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "ollama", label: "Ollama" },
] as const;
```

3. Export a `providerLabel` function:
```ts
export function providerLabel(provider: string): string {
  const entry = PROVIDER_INFO.find(p => p.value === provider);
  return entry?.label ?? provider;
}
```

4. Derive `VALID_PROVIDERS` from `PROVIDER_INFO` instead of maintaining a separate Set:
```ts
const VALID_PROVIDERS = new Set(PROVIDER_INFO.map(p => p.value));
```

### Changes to `src/app/settings/page.tsx`

1. Import `DEFAULT_MODELS`, `PROVIDER_INFO`, and `providerLabel` from `@/lib/config`
2. Remove the local `DEFAULT_MODELS` constant (lines 44-49)
3. Remove the local `providerLabel` function (lines 55-62)
4. Replace `PROVIDERS` usage: build the select options from `PROVIDER_INFO`, prepending the placeholder option:
```ts
const PROVIDER_OPTIONS = [
  { value: "", label: "— Select provider —" },
  ...PROVIDER_INFO,
] as const;
```
5. Update all references from `PROVIDERS` to `PROVIDER_OPTIONS`

### Verify no other files need updating
Search for any other files importing or duplicating these constants.

## Verification
```
pnpm build && pnpm lint && pnpm test
```
