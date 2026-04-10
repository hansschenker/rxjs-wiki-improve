Title: Settings UI page
Files: src/app/settings/page.tsx (new), src/components/NavHeader.tsx (modify)
Issue: none

## Description

Build the settings page UI that lets users configure their LLM provider through the browser. This pairs with task_01 which provides the API backend.

### 1. `src/app/settings/page.tsx` — Settings page

A client component (`"use client"`) that:

1. On mount, fetches `GET /api/settings` to display current config.
2. Shows the current provider status prominently at the top (green/amber indicator reusing the StatusBadge pattern).
3. Renders a form with fields:
   - **Provider** — dropdown: Anthropic, OpenAI, Google, Ollama
   - **API Key** — password input (shows masked value from server, allows typing a new one). Not shown for Ollama.
   - **Model** — text input with placeholder showing the default for the selected provider (e.g., "claude-sonnet-4-20250514" for Anthropic)
   - **Ollama Base URL** — text input, only shown when Ollama is selected. Placeholder: `http://localhost:11434/api`
   - **Embedding Model** — text input, optional. Placeholder explains which providers support embeddings.
4. Shows which settings come from env vars vs config file (env var settings are shown as read-only with an "(from environment)" badge).
5. Submit button sends `PUT /api/settings` and shows success/error feedback.
6. After successful save, re-fetches status and shows updated provider info.
7. Include a "Test Connection" button that calls `GET /api/status` to verify the provider is reachable after configuration.

### Design
- Follow the existing page patterns (max-w-3xl centered, consistent heading style, ← Home link)
- Use the same dark-mode-aware styling as other pages
- Form fields use standard Tailwind form styling consistent with the ingest page's input fields

### 2. `src/components/NavHeader.tsx` — Add Settings link

Add a "Settings" link (gear icon or text) to the NavHeader navigation. Place it at the end of the nav items, slightly separated from the main features (e.g., with a divider or different styling to indicate it's a utility, not a feature). Add it to both the desktop nav items and the mobile hamburger menu.

### Verification
```
pnpm build && pnpm lint && pnpm test
```
