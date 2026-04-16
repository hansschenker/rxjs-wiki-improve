# npm-publish-ready Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 9 publishable `@rxjs-spa/*` packages ready for `npm publish` by applying checklist items 1–9.

**Architecture:** Pure metadata/config changes — no source code touched. Each task targets one class of change across all packages, then a final build verifies nothing broke. The `ssr` package is excluded from most tasks because it is structurally incomplete (no vite build, no `tsconfig.build.json`); it gets a flag-only treatment.

**Tech Stack:** npm workspaces, Vite library mode, TypeScript declaration emit (`tsc -p tsconfig.build.json`), Vitest.

---

## Packages in scope

| Package | Dir | Cross-pkg peer dep |
|---------|-----|--------------------|
| `@rxjs-spa/core` | `packages/core` | — |
| `@rxjs-spa/dom` | `packages/dom` | — |
| `@rxjs-spa/errors` | `packages/errors` | `@rxjs-spa/store` (optional) |
| `@rxjs-spa/forms` | `packages/forms` | — |
| `@rxjs-spa/http` | `packages/http` | — |
| `@rxjs-spa/persist` | `packages/persist` | `@rxjs-spa/store` |
| `@rxjs-spa/router` | `packages/router` | — |
| `@rxjs-spa/store` | `packages/store` | — |
| `@rxjs-spa/testing` | `packages/testing` | — |
| `@rxjs-spa/ssr` | `packages/ssr` | `@rxjs-spa/dom` — incomplete, flag only |

## Files changed per task

| Task | Files modified |
|------|----------------|
| 1 | `LICENSE` (new), root `package.json` |
| 2 | All 10 `packages/*/package.json` |
| 3 | 8 `packages/*/tsconfig.build.json` (dom & router already correct) |
| 4 | (verify only — `npm run build && npm run test:run`) |

---

## Task 1: Add MIT LICENSE file and `"license"` field to root

**Files:**
- Create: `LICENSE`
- Modify: `package.json`

- [ ] **Step 1.1: Create the LICENSE file**

Create `LICENSE` at the repo root with the following content (replace year/name if needed):

```
MIT License

Copyright (c) 2024 Hans Schenker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 1.2: Add `"license"` to root package.json**

In `package.json` (root), add after `"name"`:
```json
"license": "MIT",
```

- [ ] **Step 1.3: Commit**

```bash
git add LICENSE package.json
git commit -m "chore: add MIT license"
```

---

## Task 2: Update all package.json files (items 1, 2, 3, 5, 6, 7, 9)

This task applies all metadata changes to every package in one commit per package to keep history clean. The exact JSON for each package is specified below — copy verbatim.

### 2a — `packages/core/package.json`

Replace the entire file with:

```json
{
  "name": "@rxjs-spa/core",
  "version": "0.1.0",
  "description": "Core RxJS stream-sharing utilities: remember() and rememberWhileSubscribed()",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/core"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "reactive", "spa", "shareReplay", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2a: Write `packages/core/package.json`** (content above)

### 2b — `packages/dom/package.json`

```json
{
  "name": "@rxjs-spa/dom",
  "version": "0.1.0",
  "description": "RxJS DOM sources (events, valueChanges), sinks (text, attr, style), templates and component primitives",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/dom"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "dom", "reactive", "spa", "template", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2b: Write `packages/dom/package.json`** (content above)

### 2c — `packages/errors/package.json`

```json
{
  "name": "@rxjs-spa/errors",
  "version": "0.1.0",
  "description": "Centralized RxJS error handling: global capture, catchAndReport, safeScan and safeSubscribe",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/errors"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "error-handling", "reactive", "spa", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0",
    "@rxjs-spa/store": ">=0.1.0"
  },
  "peerDependenciesMeta": {
    "@rxjs-spa/store": {
      "optional": true
    }
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "@rxjs-spa/store": "0.1.0",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2c: Write `packages/errors/package.json`** (content above)

### 2d — `packages/forms/package.json`

```json
{
  "name": "@rxjs-spa/forms",
  "version": "0.1.0",
  "description": "Reactive form state management with schema validation and two-way DOM binders",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/forms"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "forms", "validation", "reactive", "spa", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2d: Write `packages/forms/package.json`** (content above)

### 2e — `packages/http/package.json`

```json
{
  "name": "@rxjs-spa/http",
  "version": "0.1.0",
  "description": "RxJS HTTP client with interceptors, RemoteData state and cancellation via unsubscribe",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/http"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "http", "ajax", "remote-data", "reactive", "spa", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2e: Write `packages/http/package.json`** (content above)

### 2f — `packages/persist/package.json`

```json
{
  "name": "@rxjs-spa/persist",
  "version": "0.1.0",
  "description": "localStorage/sessionStorage persistence for @rxjs-spa/store with partial-pick, versioning and custom backends",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/persist"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "persist", "localStorage", "store", "reactive", "spa", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0",
    "@rxjs-spa/store": ">=0.1.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "@rxjs-spa/store": "0.1.0",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2f: Write `packages/persist/package.json`** (content above)

### 2g — `packages/router/package.json`

```json
{
  "name": "@rxjs-spa/router",
  "version": "0.1.0",
  "description": "RxJS hash and history mode router with param matching, guards, lazy routes and scroll reset",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/router"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "router", "routing", "spa", "hash", "history", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2g: Write `packages/router/package.json`** (content above)

### 2h — `packages/store/package.json`

```json
{
  "name": "@rxjs-spa/store",
  "version": "0.1.0",
  "description": "Elm-like MVU state management for RxJS SPAs: createStore, ofType, combineStores",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/store"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "store", "mvu", "elm", "state-management", "reactive", "spa", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2h: Write `packages/store/package.json`** (content above)

### 2i — `packages/testing/package.json`

```json
{
  "name": "@rxjs-spa/testing",
  "version": "0.1.0",
  "description": "Test utilities for @rxjs-spa: mock store, mock router, mock HTTP client and stream collectors",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/testing"
  },
  "homepage": "https://github.com/hansschenker/rxjs-spa#readme",
  "bugs": "https://github.com/hansschenker/rxjs-spa/issues",
  "keywords": ["rxjs", "testing", "mocks", "vitest", "spa", "typescript"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "engines": { "node": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc -p tsconfig.build.json",
    "test": "vitest"
  },
  "peerDependencies": {
    "rxjs": ">=7.8.0"
  },
  "devDependencies": {
    "rxjs": "7.8.2",
    "typescript": "*",
    "vite": "*",
    "vitest": "*"
  }
}
```

- [ ] **Step 2i: Write `packages/testing/package.json`** (content above)

### 2j — `packages/ssr/package.json` (flag only — incomplete package)

The `ssr` package has no Vite build, no `tsconfig.build.json`, and no dist. It should stay non-publishable until completed. Apply only the safe metadata changes:

```json
{
  "name": "@rxjs-spa/ssr",
  "version": "0.0.1",
  "private": true,
  "description": "Server-side rendering support for @rxjs-spa/dom (work in progress)",
  "license": "MIT",
  "author": "Hans Schenker",
  "repository": {
    "type": "git",
    "url": "https://github.com/hansschenker/rxjs-spa",
    "directory": "packages/ssr"
  },
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "test": "vitest"
  },
  "dependencies": {
    "rxjs": "7.8.2",
    "@rxjs-spa/dom": "0.1.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2j: Write `packages/ssr/package.json`** (content above)

- [ ] **Step 2k: Commit all package.json changes**

```bash
git add packages/*/package.json
git commit -m "chore: prep all packages for npm publish (metadata, exports, files, engines)"
```

---

## Task 3: Fix `tsconfig.build.json` — exclude test files

`dom` and `router` already have the exclusions. The other 7 packages need them added.

- [ ] **Step 3a: `packages/core/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3b: `packages/errors/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3c: `packages/forms/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3d: `packages/http/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3e: `packages/persist/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3f: `packages/store/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3g: `packages/testing/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

- [ ] **Step 3h: Commit**

```bash
git add packages/*/tsconfig.build.json
git commit -m "chore: exclude test files from declaration emit in all packages"
```

---

## Task 4: Build and test verification

- [ ] **Step 4a: Full build**

```bash
npm run build
```

Expected: all packages build without errors. Each `packages/*/dist/` should contain `index.js`, `index.cjs`, `index.d.ts`.

- [ ] **Step 4b: Verify no test `.d.ts` files in dist**

```bash
ls packages/store/dist/
ls packages/core/dist/
ls packages/errors/dist/
```

Expected output for each: `index.cjs  index.d.ts  index.d.ts.map  index.js` — no `*.test.d.ts` files.

- [ ] **Step 4c: Full test run**

```bash
npm run test:run
```

Expected: 410 tests pass, 21 test files, 0 failures.

- [ ] **Step 4d: Smoke-check npm pack output**

```bash
cd packages/store && npm pack --dry-run
```

Expected output lists only files from `dist/` and `src/` — no `node_modules`, `vite.config.ts`, `*.test.ts` etc. Also confirm `package.json` in the output has no `"private": true`.

- [ ] **Step 4e: Commit if clean**

```bash
git add -A
git commit -m "chore: verify npm-publish-ready build"
```

---

## Item 8 — npm org scope (manual action, not a code change)

The packages use the `@rxjs-spa` npm scope. Before running `npm publish` you must own this org:

1. Log in: `npm login`
2. Check if the org exists: `npm org ls rxjs-spa` (will error if not yours)
3. Create it if needed: `npm org create rxjs-spa` (or rename packages to `@hansschenker/spa-*`)
4. For scoped public packages, pass `--access public` on first publish: `npm publish --access public`

No code change is needed for this item.
