# 🧵 Web Worker Propagation Engine

The Web Worker provides a background deduction engine similar to Sudoku constraint propagation. It does not replace user input — it augments hinting, difficulty checking, and potential auto-marking.

---

## 1. Goals

- Offload heavy rule propagation from the main UI thread
- Allow complex interaction between multiple rulesets
- Enable hints and auto-X placement without freezing the UI
- Share logic with the Python solver conceptually

---

## 2. Message Protocol

### Main Thread → Worker

```ts
worker.postMessage({
  board,          // BoardFile
  state: { grid } // WorkerCell[][]
})
```

Where `WorkerCell` is a simplified cell model:

```ts
interface WorkerCell {
  color?: ColorKey | null
  solved?: boolean
  marks?: Record<ColorKey, Mark>
}
```

### Worker → Main Thread

```ts
postMessage({
  changed,
  state: { grid }
})
```

Where:

```ts
interface RuleEffect {
  type: 'fix' | 'elim'
  r: number
  c: number
  color: ColorKey
}
```

- `fix`: cell `(r,c)` must be a certain color
- `elim`: color cannot be present in `(r,c)`

---

## 3. RuleContext

The worker uses a `RuleContext` abstraction so that rules do not directly manipulate the raw `state`:

```ts
export interface RuleContext {
  meta: BoardFile['meta']
  getColor(r: number, c: number): ColorKey | null
  setCertainColor(r: number, c: number, color: ColorKey): void
  eliminateColor(r: number, c: number, color: ColorKey): void
  inBounds(r: number, c: number): boolean
}
```

Helpers:

- `getColor` returns a cell's current color or `null` if unsolved.
- `setCertainColor` sets a cell to a specific color and marks it solved.
- `eliminateColor` marks a color as impossible for a cell (e.g., by setting an X).
- `inBounds` checks whether `(r,c)` is inside the board.

---

## 4. Worker Entry

In `worker.entry.ts`:

```ts
/// <reference lib="webworker" />
import { propagateAll } from './propagate'
import type { BoardFile, ColorKey } from '../types'
import type { RuleContext } from '../rules'

function buildContext(board: BoardFile, state: any): RuleContext {
  const meta = board.meta

  const getColor = (r: number, c: number): ColorKey | null =>
    state.grid?.[r]?.[c]?.color ?? null

  const setCertainColor = (r: number, c: number, color: ColorKey) => {
    state.grid[r][c] = { ...(state.grid[r][c] || {}), color, solved: true }
  }

  const eliminateColor = (r: number, c: number, color: ColorKey) => {
    const cell = state.grid[r][c] || {}
    const marks = { ...(cell.marks || {}) }
    if (marks[color] !== 'E') marks[color] = 'X'
    state.grid[r][c] = { ...cell, marks }
  }

  const inBounds = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < meta.rows && c < meta.cols

  return { meta, getColor, setCertainColor, eliminateColor, inBounds }
}

self.onmessage = (e: MessageEvent) => {
  const { board, state } = e.data as { board: BoardFile; state: any }
  const ctx = buildContext(board, state)
  const changed = propagateAll(board, ctx)
  ;(self as any).postMessage({ changed, state })
}
```

---

## 5. Rule Execution

`propagateAll` orchestrates rule execution:

1. Loop through all cells `(r,c)`
2. For each rule in `meta.rules`:
   - Call `rule.propagate(ctx, r, c)`
3. Accumulate `RuleEffect`s
4. Repeat until no new effects, or a max iteration count is reached

Rules are free to:

- Fix colors when counts or constraints are forced
- Eliminate colors that cannot satisfy all clues

---

## 6. Main Thread Integration

The main UI can decide how to consume worker output:

- **Merge directly:** apply all `fix` and `elim` effects to the Vue state (auto-filling or auto-marking)
- **Show hints:** present a "hint" UI, allowing the player to accept or ignore changes
- **Analyze difficulty:** run propagation offline to check how deep the logic needs to go

Integration pattern:

```ts
worker.onmessage = (e) => {
  const { changed, state } = e.data
  if (!changed.length) return
  // Merge into g.grid or present hints
}
```

---

## 7. Limits & Responsibilities

The worker:

- Does **not** trigger strikes
- Does **not** validate wrong guesses
- Does **not** directly touch the Vue state
- Is **optional** — the game logic works without it

Its sole job is to reason about forced logical consequences of the current puzzle state.

---
