Title: Create shared Alert component and adopt in page components
Files: src/components/Alert.tsx (create), src/app/query/page.tsx, src/app/ingest/page.tsx, src/app/wiki/new/page.tsx, src/components/WikiEditor.tsx, src/components/BatchIngestForm.tsx
Issue: none

## Description

The codebase has 3+ different visual patterns for error/success/info alerts:

**Pattern A** (query page):
```tsx
<div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
```

**Pattern B** (ingest page, BatchIngestForm, WikiEditor):
```tsx
<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
```

**Pattern C** (ErrorBoundary / PageError):
```tsx
<p className="rounded-lg border border-red-500/20 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
```

These need to be unified into a single `<Alert>` component.

### What to build

1. **Create `src/components/Alert.tsx`** with:
   ```tsx
   interface AlertProps {
     variant: "error" | "success" | "info" | "warning";
     children: React.ReactNode;
     className?: string;
   }
   
   export function Alert({ variant, children, className }: AlertProps) {
     // Map variant to consistent Tailwind classes
     // Use Pattern A style (explicit light/dark) as the canonical look:
     // error: red border, red-50 bg, red-800 text (light) / red-950 bg, red-200 text (dark)
     // success: green equivalent
     // info: blue equivalent
     // warning: yellow equivalent
     // Merge with className for flexibility
   }
   ```

2. **Update `src/app/query/page.tsx`** — Replace the 3 inline alert divs (error display at line ~345, success alert at line ~428, save error at line ~441) with `<Alert variant="error">`, `<Alert variant="success">`, etc.

3. **Update `src/app/ingest/page.tsx`** — Replace the 2 inline error alert divs (lines ~343, ~490) with `<Alert variant="error">`.

4. **Update `src/app/wiki/new/page.tsx`** — Replace the error display (line ~117) with `<Alert variant="error">`.

5. **Update `src/components/WikiEditor.tsx`** — Replace the error display (line ~74) with `<Alert variant="error">`.

6. **Update `src/components/BatchIngestForm.tsx`** — Replace the error display (line ~222) with `<Alert variant="error">`.

Also import and use `getErrorMessage` from `src/lib/errors.ts` (created in task 1) in any catch blocks within these page components that still use the inline `instanceof Error` ternary pattern.

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All existing tests should pass. Visual consistency can be verified with `pnpm dev` but is not blocking for CI.
