# 🧱 Architecture Overview

Color Mines is built on a clean separation of concerns:

- **State:** central reactive game data (colors, marks, strikes, etc.)
- **Renderer:** Vue components that draw the board using SVG
- **Logic controller:** input handling, validation, mark/tap behavior
- **Rule propagation:** optional Web Worker for background deduction
- **Backend (optional):** Python solver + generator

This document describes the major flows in the app.

---

## 1. State Flow

All game state is managed by a single **Game Controller** created in `useGame.ts`.

Key responsibilities:

- Load boards
- Hold `CellState[][]` for all cells
- Store marks, solved colors, and strikes
- Validate moves and update win/loss state
- Trigger animations (e.g., blink when clearing `X`)
- Expose reactive properties to the UI (`rows`, `cols`, `palette`, etc.)

The controller exports a composable:

```ts
const g = useGameController()
```

This gives components access to things like:

- `g.grid` — 2D array of cell state
- `g.board` — the loaded board file (meta + colors + clues)
- `g.rows`, `g.cols` — reactive board dimensions
- `g.activeColor` — currently selected color
- `g.strikes`, `g.won` — progress state
- `g.loadBoard()`, `g.resetProgress()`, `g.fillCell()`, `g.toggleMark()`

---

## 2. Rendering Pipeline

Rendering is **data → SVG**, driven entirely by `grid[r][c]` and `board.clues[r][c]`.

### Flow

1. `App.vue` mounts and calls `fetchBoard()`, then `g.loadBoard(board)`.
2. `Board.vue` reads `g.rows` and `g.cols` and sets up a CSS grid.
3. `Board.vue` instantiates `<Cell :r="r" :c="c" />` for each position.
4. `Cell.vue` looks up its `CellState` and corresponding clue and renders:
   - Background rect (solution color if solved, neutral if not)
   - Animated overlay rect for blink effect
   - Clue text (number or rule icon)
   - Corner marks for X/O/E

All visual updates are driven by changes in reactive state.

---

## 3. Input & Game Logic

### Left Click (Fill)

Handled via:

```ts
function fillCell(r: number, c: number, color: ColorKey)
```

Behavior:

1. If cell is `solved`, ignore (no edits to solved/revealed).
2. If the cell has an `X` mark for this color:
   - Remove the `X`
   - Set `blinkAt = Date.now()` to trigger a brief border animation
   - Return early (no validation yet)
3. Otherwise:
   - Compare `color` to the true solution in `board.colors[r][c]`
   - If **correct**:
     - Mark the cell `color`, `solved = true`, `wrong = false`
     - Optionally clear any leftover contradictory mark
     - If all cells are solved → set `won = true`
   - If **wrong**:
     - Increment `strikes` (up to a max, e.g. 3)
     - Add a system `E` mark using `setSystemError`
     - Set `wrong = true` for UI feedback

### Right Click (Marks)

Marks are handled via:

```ts
function toggleMark(r: number, c: number, color: ColorKey)
```

Cycles:

```text
null → 'X' → 'O' → null
```

Rules:

- `E` marks are system-owned and cannot be changed by `toggleMark`.
- Marks do not directly affect solution state or strikes.

---

## 4. Clue Rule System

Rules determine how a clue cell interprets its value, e.g.:

- `neighbor` → 8-way adjacency like classic Minesweeper
- `knight` → chess knight moves (L-shaped hops)
- Other custom rules (row/column, streaks, regions, etc.) are extensible.

A clue is a discriminated union so each scope carries its metadata:

```ts
type Clue =
  | { rule: RuleName; category: 'cell'; value: number; payload: { affectedCells: number[][] } }
  | { rule: RuleName; category: 'line'; value: number; payload: { lines: number[][][]; lineMatches: number[] } }
  | { rule: RuleName; category: 'board'; value: number; payload: { counts: Record<ColorKey, number> } }
```

At load time:

1. The frontend reads `meta.rules`.
2. For each rule in `rules`, it applies rule-specific logic to compute clues from `colors`.
3. A `Clue[][]` array is built and attached to the in-memory board.

---

## 5. Web Worker (Optional Propagation Engine)

The project includes an experimental propagation engine that runs in a Web Worker. It is designed to:

- Run more advanced deductions in the background
- Avoid blocking the main UI thread
- Provide hints or auto-X placements

Worker responsibilities:

1. Receive a copy of the `BoardFile` and a simplified `grid` state
2. Apply all active rules to compute forced deductions
3. Emit:
   - "These cells must be a specific color", and/or
   - "These cells cannot be certain colors"
4. Return updated state + a set of effects to the main thread

The main thread may choose to:

- Merge the worker’s updates into the live grid
- Show them as suggested moves
- Use them for difficulty analysis only

See `docs/web-workers.md` for details.

---

## 6. Backend (Python) Overview

The Python backend (optional) includes:

- A **deterministic solver** that operates on the same rule-set concept
- A **generator** that:
  - Creates random solution color grids
  - Computes clues for all rules
  - Iteratively picks a minimal set of givens (`initial`)
  - Grades difficulty by running the solver
- A validator that ensures:
  - Unique solution
  - Consistency of clues and colors

Frontend can consume boards via:

- Static JSON files in `/public/boards`
- HTTP API endpoints (FastAPI or similar) when the backend is running

---

## 7. Simulation Mode (Planned)

Simulation Mode is an advanced overlay system that:

- Adds five independent "tracing paper" layers on top of the grid
- Allows hypothetical color placement (no strikes, no validation)
- Adds overlay marks (X/O) and cell pins
- Has its own tools and UI (layer selector, clear, etc.)

Simulation Mode operates on separate **sim state** and does not modify the base game state.

See `docs/simulation-mode.md` for the full design.

---
