---
title: 'RxJS Deep Dive — Course Recording Workflow'
category: patterns
tags: [course, recording, workflow, marp, curriculum, production]
related: ['patterns/mvu.md', 'patterns/effects.md', 'architectures/mvu.md']
sources: ['rxjs-deep-dive-claude-superpowers/docs/superpowers/specs/2026-04-10-rxjs-deep-dive-course-design.md']
updated: '2026-04-12'
---

# RxJS Deep Dive — Course Recording Workflow

> Three sibling repos, five phases, one lesson at a time: curriculum.json drives everything from wiki-sourced slide generation through live-coding recordings to Udemy upload.

---

## Overview

The production pipeline separates **content** (rxjs-wiki), **course structure** (rxjs-deep-dive-claude-superpowers), and **live code** (rxjs-spa) into three sibling repositories. `curriculum.json` is the single source of truth that ties them together.

```
rxjs-wiki/                          ← knowledge base (never modified for the course)
  slides/                           ← auto-generated Marp drafts

rxjs-deep-dive-claude-superpowers/  ← course production repo
  curriculum.json                   ← lesson index: IDs, wiki sources, companion paths
  scripts/                          ← generate-slides, check-readiness, export-pdf, notes
  slides-polished/                  ← hand-polished record-ready decks
  docs/recording-notes/             ← per-lesson talking points and demo code

rxjs-spa/                           ← companion app (pure RxJS + TS, no framework)
  section-00-start … section-10-start  ← git tags, one per section
```

---

## Phase 0 — One-Time Setup

All three repos must be siblings in the same parent directory. The scripts in `rxjs-deep-dive-claude-superpowers` use relative paths (`../rxjs-wiki`, `../rxjs-spa`); `assertSiblingDirs()` validates this at startup.

```bash
parent/
  rxjs-wiki/
  rxjs-deep-dive-claude-superpowers/
  rxjs-spa/
```

`rxjs-spa` must have all section start tags in place:

```bash
cd rxjs-spa
git tag | grep section   # should list section-00-start … section-10-start
```

---

## Phase 1 — Slide Production (per lesson)

### 1.1 Check status

```bash
npm run check              # prints readiness report for all 52 lessons
```

Output:
```
Section 2 — Async Coordination
  2.1   Higher-order operators: what flattening means      [polished]  ✓
  2.2   switchMap live queries search cancellation         [polished]  ✓
  2.3   concatMap ordered queues animations                [draft]     ○
  2.4   exhaustMap form submit login debounced actions     [missing]   ✗
```

### 1.2 Generate draft

```bash
npm run generate 2.3       # generates one lesson
npm run generate           # generates all missing lessons
```

`generate-slides.ts` reads the `wikiSources` listed in `curriculum.json` for that lesson, passes them as context to the `claude` CLI (via `spawnSync`), and writes a Marp `.md` to `rxjs-wiki/slides/`. Existing files are never overwritten — delete to regenerate.

### 1.3 Polish pass

Copy the draft from `rxjs-wiki/slides/` to `slides-polished/` and edit it to enforce the **6-slide skeleton**:

| Slide | Content |
|-------|---------|
| 1 | Title + one-sentence problem statement |
| 2 | Core Concept — 3–5 bullets, key rule quoted verbatim |
| 3 | How It Works — ASCII marble diagram OR TypeScript code block |
| 4 | Common Mistake — wrong approach with explanatory comment |
| 5 | The Right Way — correct `pipe()` chain with comments on key lines |
| 6 | Key Rule — one bold sentence, no hedging |

Polish checklist:
- Marble diagrams annotated (label inputs, outputs, cancellation points)
- Wrong-way example shows a real intermediate-dev anti-pattern
- Right-way example uses `pipe()`, never nested subscribes
- Key Rule is one sentence, imperative, no "usually" / "sometimes"

### 1.4 Confirm polished

```bash
npm run check 2.3          # should show [polished] ✓
```

---

## Phase 2 — Recording Notes (per lesson)

### 2.1 Scaffold

```bash
npm run notes 2.3          # creates docs/recording-notes/section-02/02-03-*.md
```

Generates a filled-header stub from `docs/recording-notes/template.md`. The stub already contains the lesson ID, section, companion path, and wiki sources.

### 2.2 Fill in manually

Each recording note has six sections to complete before recording:

**Hook (30–60s)**
The production pain-point that opens the lesson. Start with "Have you ever…" or "You've hit this when…". This is not a definition — it is a story about a bug.

**Slide Walkthrough Notes (one entry per slide)**
What to say as each slide appears. Include:
- Which bullet points to dwell on
- Any nuance not visible in the slide text
- How to narrate the marble diagram step-by-step
- The concrete scenario behind the wrong-way example

**Live Coding Demo**
Exact code to type. Includes:
- `git checkout section-NN-start` command
- Which file to open in VS Code
- Step-by-step code additions, numbered
- Expected browser/terminal output after each step

**Recap (15s)**
One sentence — the key rule restated in plain language.

**What's Next (15s)**
A bridge sentence to the following lesson. Sets up the contrast or continuation.

---

## Phase 3 — Recording Session (per lesson, 8–12 min)

Each lesson is recorded in two segments back-to-back.

### Segment A — Slides (4–6 min)

1. Open `slides-polished/[slug].md` in VS Code with the Marp extension preview (full-screen).
2. Start screen capture at 1080p.
3. Follow the recording notes:
   - Hook (spoken to camera or voice-over)
   - Walk slides 1–6 per the walkthrough notes
   - Pause on the marble diagram — narrate step by step
   - On slide 6 (Key Rule): read it aloud, pause, repeat it once.

### Segment B — Live Coding (4–6 min)

1. `cd rxjs-spa && git checkout section-NN-start` (visible in terminal).
2. Open the relevant app or package in VS Code (from `companionPath` in `curriculum.json`).
3. Follow the recording notes demo steps — type code as written, no skipping.
4. Show the output (browser DevTools, terminal, or live preview).
5. Close with the "What's Next" bridge.

### Companion app entry points by section

| Section | App / Package |
|---------|---------------|
| 0 | Slides only — no live code |
| 1 | `apps/starter-minimal` |
| 2 | `packages/http` + `apps/playground` |
| 3 | `packages/store` + `packages/persist` |
| 4 | `packages/dom` |
| 5 | `packages/errors` + `packages/http` |
| 6 | `packages/core` |
| 7 | `packages/router` |
| 8 | `apps/shop` (complete assembly) |
| 9 | `packages/testing` |
| 10 | `apps/demo`, `apps/snake` |

---

## Phase 4 — Post-Production

```bash
npm run export-pdf         # exports all polished slides to slides-polished/pdf/
npm run export-pdf 2.3     # exports one lesson
```

PDFs are uploaded to Udemy as downloadable resources alongside the video.

Post-production steps per section:
1. Edit recordings — trim dead air, add section title card.
2. Export at 1080p (H.264 or H.265).
3. Upload to Udemy draft course section by section.
4. Set captions (auto-generate, then review).
5. Add PDF resources to each lesson.

---

## Readiness Status Values

| Symbol | Value | Meaning |
|--------|-------|---------|
| `✗` | `missing` | No slide file exists anywhere |
| `○` | `draft` | File exists in `rxjs-wiki/slides/` only |
| `✓` | `polished` | File exists in `slides-polished/` — record-ready |

A lesson is ready to record when `check` reports `[polished] ✓` AND its recording note has all TODOs replaced.

---

## Related

- [MVU Pattern](patterns/mvu.md) — architectural pattern demonstrated in section 8
- [Effects Pattern](patterns/effects.md) — demonstrated in sections 7–8
- [MVU Architecture](architectures/mvu.md) — full wiring used in `apps/shop`
