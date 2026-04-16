// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const COLS = 20
export const ROWS = 20

export const LEVELS = [
  { label: 'Easy',   speed: 200 },
  { label: 'Medium', speed: 130 },
  { label: 'Hard',   speed: 70  },
] as const

export type LevelIndex = 0 | 1 | 2

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Point     = { x: number; y: number }
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
export type Phase     = 'IDLE' | 'RUNNING' | 'PAUSED' | 'DEAD'
export type CellType  = 'empty' | 'snake-head' | 'snake-body' | 'food'

export interface LeaderboardEntry {
  name: string
  score: number
  level: string
  date: string
}

export interface GameState {
  phase: Phase
  snake: Point[]
  dir: Direction
  nextDir: Direction
  food: Point
  score: number
  level: LevelIndex
  // flat grid for DOM rendering: index = y * COLS + x
  grid: CellType[]
  leaderboard: LeaderboardEntry[]
}

export type GameAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STEER'; dir: Direction }
  | { type: 'TICK' }
  | { type: 'SET_LEVEL'; level: LevelIndex }
  | { type: 'SAVE_SCORE'; name: string }
  | { type: 'RESET' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomCell(exclude: Point[]): Point {
  let p: Point
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (exclude.some(e => e.x === p.x && e.y === p.y))
  return p
}

function move(head: Point, dir: Direction): Point {
  switch (dir) {
    case 'UP':    return { x: head.x, y: head.y - 1 }
    case 'DOWN':  return { x: head.x, y: head.y + 1 }
    case 'LEFT':  return { x: head.x - 1, y: head.y }
    case 'RIGHT': return { x: head.x + 1, y: head.y }
  }
}

function isOpposite(a: Direction, b: Direction) {
  return (a === 'UP' && b === 'DOWN') || (a === 'DOWN' && b === 'UP') ||
         (a === 'LEFT' && b === 'RIGHT') || (a === 'RIGHT' && b === 'LEFT')
}

function buildGrid(snake: Point[], food: Point): CellType[] {
  const grid: CellType[] = new Array(COLS * ROWS).fill('empty')
  grid[food.y * COLS + food.x] = 'food'
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i]
    grid[s.y * COLS + s.x] = i === 0 ? 'snake-head' : 'snake-body'
  }
  return grid
}

function initialSnake(): Point[] {
  const cx = Math.floor(COLS / 2)
  const cy = Math.floor(ROWS / 2)
  return [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }]
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem('snake-leaderboard') ?? '[]')
  } catch { return [] }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  localStorage.setItem('snake-leaderboard', JSON.stringify(entries))
}

export function freshState(level: LevelIndex = 1, leaderboard: LeaderboardEntry[] = []): GameState {
  const snake = initialSnake()
  const food  = randomCell(snake)
  return {
    phase: 'IDLE',
    snake,
    dir: 'RIGHT',
    nextDir: 'RIGHT',
    food,
    score: 0,
    level,
    grid: buildGrid(snake, food),
    leaderboard,
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SET_LEVEL':
      return { ...freshState(action.level, state.leaderboard), level: action.level }

    case 'START':
      return { ...freshState(state.level, state.leaderboard), phase: 'RUNNING' }

    case 'RESET':
      return freshState(state.level, state.leaderboard)

    case 'PAUSE':
      return state.phase === 'RUNNING' ? { ...state, phase: 'PAUSED' } : state

    case 'RESUME':
      return state.phase === 'PAUSED' ? { ...state, phase: 'RUNNING' } : state

    case 'STEER': {
      if (isOpposite(action.dir, state.dir)) return state
      return { ...state, nextDir: action.dir }
    }

    case 'SAVE_SCORE': {
      const entry: LeaderboardEntry = {
        name: action.name.trim() || 'Anonymous',
        score: state.score,
        level: LEVELS[state.level].label,
        date: new Date().toLocaleDateString(),
      }
      const updated = [...state.leaderboard, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      saveLeaderboard(updated)
      return { ...freshState(state.level, updated) }
    }

    case 'TICK': {
      if (state.phase !== 'RUNNING') return state

      const dir  = state.nextDir
      const head = move(state.snake[0], dir)

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return { ...state, phase: 'DEAD' }
      }

      const body = state.snake.slice(0, -1)
      if (body.some(s => s.x === head.x && s.y === head.y)) {
        return { ...state, phase: 'DEAD' }
      }

      const ate      = head.x === state.food.x && head.y === state.food.y
      const newSnake = ate ? [head, ...state.snake] : [head, ...state.snake.slice(0, -1)]
      const newScore = ate ? state.score + 10 * (state.level + 1) : state.score
      const newFood  = ate ? randomCell(newSnake) : state.food

      return {
        ...state,
        dir,
        snake: newSnake,
        food: newFood,
        score: newScore,
        grid: buildGrid(newSnake, newFood),
      }
    }
  }
}
