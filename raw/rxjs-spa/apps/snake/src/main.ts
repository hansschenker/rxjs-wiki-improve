import { fromEvent, of, switchMap, timer } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { html, list, when } from '@rxjs-spa/dom'
import { createStore } from '@rxjs-spa/store'
import { gameReducer, freshState, loadLeaderboard, LEVELS } from './game'
import type { Direction, LevelIndex } from './game'
import { gridView } from './grid'
import { leaderboardView } from './leaderboard'
import './style.css'

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const store = createStore(gameReducer, freshState(1, loadLeaderboard()))

// ---------------------------------------------------------------------------
// Dynamic game loop — speed changes with level
// ---------------------------------------------------------------------------

// switchMap restarts the interval whenever level changes
const level$ = store.select(s => s.level)

const tickSub = level$.pipe(
  switchMap(lvl => timer(0, LEVELS[lvl].speed)),
).subscribe(() => {
  if (store.getState().phase === 'RUNNING') {
    store.dispatch({ type: 'TICK' })
  }
})

// ---------------------------------------------------------------------------
// Keyboard input
// ---------------------------------------------------------------------------

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
  W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
}

const keySub = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  filter(e => !(e.target instanceof HTMLInputElement)),
).subscribe(e => {
  const { phase } = store.getState()

  if (e.key in KEY_MAP) {
    e.preventDefault()
    const dir = KEY_MAP[e.key]
    if (phase === 'IDLE') store.dispatch({ type: 'START' })
    else store.dispatch({ type: 'STEER', dir })
    return
  }

  if (e.key === 'p' || e.key === 'P') {
    if (phase === 'RUNNING') store.dispatch({ type: 'PAUSE' })
    else if (phase === 'PAUSED') store.dispatch({ type: 'RESUME' })
  }
})

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const phase$       = store.select(s => s.phase)
const score$       = store.select(s => s.score)
const grid$        = store.select(s => s.grid)
const leaderboard$ = store.select(s => s.leaderboard)
const levelIdx$    = store.select(s => s.level)
const speedLabel$  = levelIdx$.pipe(map(l => LEVELS[l].label))

const isIdle$    = phase$.pipe(map(p => p === 'IDLE'))
const isRunning$ = phase$.pipe(map(p => p === 'RUNNING'))
const isPaused$  = phase$.pipe(map(p => p === 'PAUSED'))
const isDead$    = phase$.pipe(map(p => p === 'DEAD'))

// ---------------------------------------------------------------------------
// Save-score modal (shown on DEAD)
// ---------------------------------------------------------------------------

let pendingName = ''

const saveScore = () => {
  store.dispatch({ type: 'SAVE_SCORE', name: pendingName })
  pendingName = ''
}

const skipScore = () => {
  pendingName = ''
  store.dispatch({ type: 'RESET' })
}

// ---------------------------------------------------------------------------
// Level buttons helper
// ---------------------------------------------------------------------------

const levelsData = of(LEVELS.map((lv, i) => ({ label: lv.label, i })))

function levelButtons() {
  return html`
    <div class="level-btns">
      ${list(
        levelsData,
        lv => String(lv.i),
        (lv$) => {
          const cls$ = levelIdx$.pipe(
            map(l => l === lv$.snapshot().i ? 'level-btn active' : 'level-btn')
          )
          return html`
            <button
              class="${cls$}"
              @click=${() => store.dispatch({ type: 'SET_LEVEL', level: lv$.snapshot().i as LevelIndex })}
            >${lv$.snapshot().label}</button>
          `
        },
      )}
    </div>
  `
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

const { fragment, sub: uiSub } = html`
  <div class="snake-app">

    <!-- ── Header ── -->
    <header class="snake-header">
      <h1>🐍 Snake</h1>
      <div class="header-right">
        <div class="stat">Score <span class="stat-val">${score$}</span></div>
        <div class="stat">Level <span class="stat-val">${speedLabel$}</span></div>
      </div>
    </header>

    <!-- ── Main area ── -->
    <div class="main-area">

      <!-- Left panel: controls -->
      <aside class="side-panel">
        <section class="panel-section">
          <h3>Speed</h3>
          ${levelButtons()}
        </section>
        <section class="panel-section">
          <h3>Controls</h3>
          <ul class="controls-list">
            <li><kbd>↑↓←→</kbd> / <kbd>WASD</kbd> Move</li>
            <li><kbd>P</kbd> Pause</li>
          </ul>
        </section>
      </aside>

      <!-- Centre: grid + overlays -->
      <div class="grid-wrapper">
        <div class="grid-mount"></div>

        <!-- IDLE overlay -->
        ${when(isIdle$, () => html`
          <div class="overlay">
            <p class="overlay-title">SNAKE</p>
            <p class="overlay-sub">Press any arrow key or WASD to start</p>
            ${levelButtons()}
          </div>
        `)}

        <!-- PAUSED overlay -->
        ${when(isPaused$, () => html`
          <div class="overlay">
            <p class="overlay-title">PAUSED</p>
            <p class="overlay-sub">Press P to resume</p>
          </div>
        `)}

        <!-- DEAD overlay — save score modal -->
        ${when(isDead$, () => html`
          <div class="overlay">
            <p class="overlay-title">GAME OVER</p>
            <p class="overlay-sub">Score: <strong>${score$}</strong></p>
            <div class="save-form">
              <input
                class="name-input"
                type="text"
                placeholder="Enter your name…"
                maxlength="20"
                @input=${(e: Event) => { pendingName = (e.target as HTMLInputElement).value }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') saveScore() }}
              />
              <div class="save-actions">
                <button class="btn btn-primary" @click=${saveScore}>Save Score</button>
                <button class="btn btn-ghost"   @click=${skipScore}>Skip</button>
              </div>
            </div>
          </div>
        `)}
      </div>

      <!-- Right panel: leaderboard -->
      <aside class="side-panel">
        ${leaderboardView(leaderboard$)}
      </aside>

    </div>

  </div>
`

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const root = document.getElementById('app')!
root.appendChild(fragment)

// Mount grid into placeholder
const gridMount = fragment.querySelector('.grid-mount') ?? root.querySelector('.grid-mount')!
const { fragment: gridEl, sub: gridSub } = gridView(grid$)
gridMount.replaceWith(gridEl)

// ---------------------------------------------------------------------------
// HMR cleanup
// ---------------------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    tickSub.unsubscribe()
    keySub.unsubscribe()
    gridSub.unsubscribe()
    uiSub.unsubscribe()
    root.innerHTML = ''
  })
}
