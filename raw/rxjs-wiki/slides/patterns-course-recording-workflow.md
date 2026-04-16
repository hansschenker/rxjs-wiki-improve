---
marp: true
theme: uncover
title: 'RxJS Deep Dive — Course Recording Workflow'
---

# RxJS Deep Dive — Course Recording Workflow
> Three sibling repos, five phases, one lesson at a time: curriculum.json drives everything from wiki-sourced slide generation through live-coding recordings to Udemy upload.

---

## Overview

- **Three sibling repos**: `rxjs-wiki` (content), `rxjs-deep-dive-claude-superpowers` (production), `rxjs-spa` (live code)
- **`curriculum.json`** is the single source of truth — 11 sections, 52 lessons, wiki sources, companion paths
- **Five phases**: setup → slide production → recording notes → recording → post-production
- Scripts enforce a strict **lesson slug** format (`NN-NN-kebab-title`) used everywhere: drafts, polished slides, PDFs, recording notes
- `assertSiblingDirs()` validates the sibling layout at startup — no silent path failures

---

## Phase 1 — Slide Production

```bash
npm run check              # readiness report: ✗ missing / ○ draft / ✓ polished
npm run generate 2.3       # generate Marp draft via claude CLI + wiki sources
# manually polish into slides-polished/ → enforce 6-slide skeleton
npm run check 2.3          # confirm [polished] ✓
```

**6-slide skeleton:**

| # | Slide |
|---|-------|
| 1 | Title + problem statement |
| 2 | Core Concept — 3–5 bullets, key rule quoted |
| 3 | How It Works — marble diagram or TS code |
| 4 | Common Mistake — wrong approach |
| 5 | The Right Way — `pipe()` chain with comments |
| 6 | Key Rule — one bold sentence, no hedging |

---

## Phase 2 — Recording Notes

```bash
npm run notes 2.3    # scaffold docs/recording-notes/section-02/02-03-*.md
```

Fill in manually before recording:

- **Hook (30–60s)** — production pain-point story, "Have you ever…"
- **Slide Walkthrough** — what to say per slide, how to narrate marble diagram
- **Live Coding Demo** — exact code to type, `git checkout section-NN-start`, expected output
- **Recap (15s)** — key rule restated in plain language
- **What's Next (15s)** — bridge to the next lesson

---

## Phase 3 — Recording Session

**Segment A — Slides (4–6 min)**
- Open `slides-polished/[slug].md` in VS Code Marp preview (full-screen)
- Follow recording notes: Hook → slides 1–6 → Key Rule (read, pause, repeat)

**Segment B — Live Coding (4–6 min)**
```bash
cd rxjs-spa && git checkout section-02-start
```
- Open companion app/package from `companionPath` in `curriculum.json`
- Type demo code from recording notes step by step
- Show browser/DevTools output → close with "What's Next"

---

## Companion App by Section

| Section | Entry Point |
|---------|-------------|
| 0 | Slides only |
| 1 | `apps/starter-minimal` |
| 2 | `packages/http` + `apps/playground` |
| 3 | `packages/store` + `packages/persist` |
| 4 | `packages/dom` |
| 5 | `packages/errors` + `packages/http` |
| 6 | `packages/core` |
| 7 | `packages/router` |
| 8 | `apps/shop` (complete) |
| 9 | `packages/testing` |
| 10 | `apps/demo`, `apps/snake` |

---

## Phase 4 — Post-Production

```bash
npm run export-pdf         # slides-polished/pdf/ — upload as Udemy resources
```

- Edit recordings: trim dead air, add section title card
- Export at **1080p** (H.264/H.265)
- Upload section-by-section to Udemy draft
- Add PDF resources to each lesson; set auto-captions

**Key Rule**
> **A lesson is record-ready only when `check` shows `[polished] ✓` AND the recording note has zero TODO items.**
