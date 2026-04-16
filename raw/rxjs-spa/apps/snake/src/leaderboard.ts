import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { html, list, when } from '@rxjs-spa/dom'
import type { LeaderboardEntry } from './game'

export function leaderboardView(entries$: Observable<LeaderboardEntry[]>) {
  const hasEntries$ = entries$.pipe(map(e => e.length > 0))

  return html`
    <div class="leaderboard">
      <h2>🏆 Leaderboard</h2>
      ${when(
        hasEntries$,
        () => html`
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Score</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${list(
                entries$,
                (e, i) => `${i}-${e.name}-${e.score}`,
                (entry$, _key) => {
                  const rank$ = entries$.pipe(
                    map(all => all.findIndex(e =>
                      e.name === entry$.snapshot().name &&
                      e.score === entry$.snapshot().score
                    ) + 1)
                  )
                  const name$  = entry$.pipe(map(e => e.name))
                  const score$ = entry$.pipe(map(e => e.score))
                  const level$ = entry$.pipe(map(e => e.level))
                  const date$  = entry$.pipe(map(e => e.date))
                  const rowCls$ = rank$.pipe(map(r => r === 1 ? 'row-gold' : r === 2 ? 'row-silver' : r === 3 ? 'row-bronze' : ''))

                  return html`
                    <tr class="${rowCls$}">
                      <td>${rank$}</td>
                      <td>${name$}</td>
                      <td>${score$}</td>
                      <td>${level$}</td>
                      <td>${date$}</td>
                    </tr>
                  `
                },
              )}
            </tbody>
          </table>
        `,
        () => html`<p class="no-scores">No scores yet. Play a game!</p>`,
      )}
    </div>
  `
}
