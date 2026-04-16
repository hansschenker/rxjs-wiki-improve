import { Observable } from 'rxjs'
import { COLS, ROWS } from './game'
import type { CellType } from './game'

/**
 * DOM grid — fixed 400 cells, built once, updated imperatively via grid$ subscription.
 * Avoids list() wrapper div which breaks CSS Grid layout.
 */
export function gridView(grid$: Observable<CellType[]>) {
  const container = document.createElement('div')
  container.className = 'grid'
  container.style.setProperty('--cols', String(COLS))
  container.style.setProperty('--rows', String(ROWS))

  // Build all cells once
  const cells: HTMLDivElement[] = []
  for (let i = 0; i < COLS * ROWS; i++) {
    const cell = document.createElement('div')
    cell.className = 'cell empty'
    container.appendChild(cell)
    cells.push(cell)
  }

  // Subscribe and patch only changed cells
  const sub = grid$.subscribe(grid => {
    for (let i = 0; i < grid.length; i++) {
      const wanted = `cell ${grid[i]}`
      if (cells[i].className !== wanted) {
        cells[i].className = wanted
      }
    }
  })

  // Return a plain object compatible with how main.ts uses it
  return { fragment: container, sub }
}
