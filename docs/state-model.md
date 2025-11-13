# 🧬 State Model

This document describes the key data structures used by the Color Mines frontend.

---

## 1. BoardFile (Loaded JSON)

```ts
export interface BoardFile {
  meta: Meta
  colors: ColorKey[][]
  initial: [number, number][]
  // In-memory only:
  clues?: Clue[][]
}
```

Where:

```ts
export interface Meta {
  rows: number
  cols: number
  palette: ColorKey[]
  rules: RuleName[]
  difficulty: string
  smooth?: number
  seed?: number | null
  generator?: string
  generated_utc?: string
  initial_count?: number
  colors_sha1_12?: string
}
```

Notes:

- `colors` is the complete solution grid.
- `initial` lists coordinates of cells revealed at start.
- `clues` is computed on load and not stored in JSON.

---

## 2. Colors and Palettes

Colors are stored as **keys**, not hex codes:

```ts
export type ColorKey = 'a' | 'b' | 'c' | 'd'
```

Visual configuration:

```ts
export interface ColorStyle {
  key: ColorKey
  main: string       // fill color
  fg: string         // text color
  fgDisabled: string // disabled text
}
```

Theme selection via:

```ts
export type PaletteKey = 'default' | 'sunset' | 'mono'
```

---

## 3. Per-Cell State

Each cell on the board is represented by:

```ts
export type Mark = 'X' | 'O' | 'E' | null

export interface CellState {
  color?: ColorKey | null
  solved?: boolean
  marks?: Record<ColorKey, Mark>
  revealed?: boolean
  wrong?: boolean
  blinkAt?: number
}
```

### Field semantics

- `color`  
  The visible, confirmed color for the cell. Only set once the cell is solved or revealed.

- `solved`  
  `true` if the cell is permanently solved (either part of the initial givens or correctly filled by the player).

- `marks`  
  Per-color user/system marks:
  - `'X'`: "This cell cannot be this color."
  - `'O'`: "This cell might be this color."
  - `'E'`: System error mark (set when a wrong guess is made). Immutable.

- `revealed`  
  `true` if the cell was part of the initial givens (pre-solved by the puzzle).

- `wrong`  
  Used for transient UI feedback indicating a recent wrong attempt.

- `blinkAt`  
  Timestamp used to trigger a short blink animation when the user taps a color that previously had an `'X'` mark.

The entire board state is held as:

```ts
CellState[][]
```

mirroring the size of `colors`.

---

## 4. Clue Model

A clue is:

```ts
export interface Clue {
  rule: RuleName   // e.g., 'neighbor', 'knight'
  value: number
}
```

The frontend constructs a `Clue[][]` grid based on `colors` and active rules in `meta.rules`.

---

## 5. Controller State (useGame)

The `useGameController()` composable maintains:

```ts
const boardRef  = ref<BoardFile | null>(null)
const gridRef   = ref<CellState[][]>([])
const activeColorRef = ref<ColorKey | null>(null)
const strikesRef     = ref(0)
const wonRef         = ref(false)
const themeRef       = ref<PaletteKey>('default')

const rows = computed(() => boardRef.value?.meta.rows ?? 0)
const cols = computed(() => boardRef.value?.meta.cols ?? 0)
```

Exposed as:

```ts
return {
  board: boardRef,
  grid: gridRef,
  activeColor: activeColorRef,
  strikes: strikesRef,
  won: wonRef,
  theme: themeRef,
  rows,
  cols,
  loadBoard,
  resetProgress,
  setTheme,
  styleFor,
  hexFor,
  fillCell,
  toggleMark
}
```

---

## 6. Worker State

The Web Worker uses a simplified state representation:

```ts
interface WorkerCell {
  color?: ColorKey | null
  solved?: boolean
  marks?: Record<ColorKey, Mark>
}
```

The worker receives:

```ts
{
  board: BoardFile,
  state: { grid: WorkerCell[][] }
}
```

It updates `state.grid` and sends it back.

---

## 7. Simulation Mode State (Planned)

Simulation Mode introduces additional overlay state:

```ts
export type SimLayerId = 1 | 2 | 3 | 4 | 5
export type RC = string // "r,c"
export type SimMark = 'X' | 'O'

export interface SimLayer {
  id: SimLayerId
  name: string
  fills: Record<RC, ColorKey>
  pins: Set<RC>
  simMarks: Record<RC, Record<ColorKey, SimMark>>
}

export interface SimState {
  enabled: boolean
  active: SimLayerId
  tool: 'fill' | 'pin' | 'mark'
  layers: Record<SimLayerId, SimLayer>
}
```

This overlay state is entirely separate from the base `CellState` grid.

---
