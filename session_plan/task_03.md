Title: Decompose settings page into sub-components
Files: src/components/ProviderForm.tsx (create), src/components/EmbeddingSettings.tsx (create), src/app/settings/page.tsx, src/app/error.tsx
Issue: none

## Description

At 616 lines, `settings/page.tsx` is the largest page component. It mixes:
- Data fetching (2 `useCallback` + `useEffect`)
- 3 async handlers (save, test, rebuild)
- 10+ `useState` hooks
- The `SourceBadge` helper component (inline)
- A complex form with 5 field groups
- 3 feedback display sections

The component should be decomposed so the page file orchestrates state and delegates rendering to focused sub-components.

### What to build

1. **Create `src/components/ProviderForm.tsx`** — Extract the provider configuration form (provider select, API key, model, Ollama URL fields). This component receives:
   - Form field values + setters (provider, apiKey, model, ollamaBaseUrl)
   - The `EffectiveSettings` object for `SourceBadge` rendering
   - The `DEFAULT_MODELS` and `PROVIDER_OPTIONS` constants
   
   Props interface:
   ```ts
   interface ProviderFormProps {
     provider: string;
     setProvider: (v: string) => void;
     apiKey: string;
     setApiKey: (v: string) => void;
     model: string;
     setModel: (v: string) => void;
     ollamaBaseUrl: string;
     setOllamaBaseUrl: (v: string) => void;
     settings: EffectiveSettings | null;
   }
   ```
   
   Move the `SourceBadge` helper into this file (it's used in both sub-components, so alternatively put it in its own tiny file or export from ProviderForm).

2. **Create `src/components/EmbeddingSettings.tsx`** — Extract the embedding model field + rebuild vector index section. This component receives:
   - `embeddingModel` + setter
   - `settings` for SourceBadge
   - `rebuilding` state + `onRebuild` handler
   - `rebuildResult` state
   
   Props interface:
   ```ts
   interface EmbeddingSettingsProps {
     embeddingModel: string;
     setEmbeddingModel: (v: string) => void;
     settings: EffectiveSettings | null;
     rebuilding: boolean;
     onRebuild: () => void;
     rebuildResult: { ok: boolean; message: string } | null;
   }
   ```

3. **Update `src/app/settings/page.tsx`** — Import the two new components and replace the corresponding JSX sections. The page component retains:
   - All state declarations
   - `fetchSettings`, `fetchStatus`, `handleSave`, `handleTest`, `handleRebuildEmbeddings`
   - The status indicator section
   - The form wrapper (`<form onSubmit={handleSave}>`) with sub-components inside
   - The save/test buttons and feedback sections

   The goal is to reduce the page from ~616 lines to ~350-400 lines by moving ~200+ lines of form field JSX into the sub-components.

4. **Update `src/app/error.tsx`** — Make it use the `PageError` component from `src/components/ErrorBoundary.tsx` instead of its own bespoke layout. This is a quick consistency fix:
   ```tsx
   import { PageError } from "@/components/ErrorBoundary";
   
   export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
     return <PageError title="Something went wrong" description="An unexpected error occurred." backHref="/" backLabel="Go home" error={error} reset={reset} />;
   }
   ```

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All existing tests should pass. The settings page should render identically — this is a pure refactor with no behavior changes.
