# 📄 Board JSON Specification

A Color Mines puzzle is delivered as a single JSON file.  
The frontend and backend both adhere to this format.

---

## 1. Top-level Structure

```json
{
  "meta": { ... },
  "colors": [ ... ],
  "initial": [ [r,c], ... ]
}
```

---

## 2. meta

```ts
interface BoardMeta {
  rows: number
  cols: number
  palette: ColorKey[]
  rules: RuleName[]
  difficulty?: string
  smooth?: number
  seed?: number | null
  generator?: string
  generated_utc?: string
  initial_count?: number
  colors_sha1_12?: string
}
```

Notes:

- `palette` lists which color keys are used (e.g., `['a','b','c']`).
- `rules` indicates which clue rules are active (e.g., `['neighbor','knight']`).
- `difficulty` can be "easy", "medium", "hard", etc.
- `colors_sha1_12` is a short hash of the colors grid for deduplication/caching.

---

## 3. colors

A `rows × cols` grid of solution color keys:

```json
"colors": [
  ["a","a","b","b","c","b"],
  ["a","b","b","b","c","a"],
  ["b","b","c","c","a","a"],
  ["c","a","a","b","b","c"],
  ["c","c","a","a","b","b"],
  ["b","a","c","c","a","b"]
]
```

Semantics:

- Each entry is a `ColorKey` such as `'a' | 'b' | 'c' | 'd'`.
- This grid is the full *answer key* and is never shown directly.

---

## 4. initial

The `initial` array lists coordinates of cells that are pre-solved:

```json
"initial": [
  [0, 4],
  [1, 1],
  [1, 5],
  [3, 0],
  [3, 4],
  [4, 1],
  [4, 4]
]
```

Rules:

- These cells are shown to the player with their true color at start.
- They cannot be changed or overwritten by the player.
- They are counted as `solved` in the state model.

---

## 5. Clues

Clue values are **not** stored in JSON by default. Instead:

1. The frontend looks at `meta.rules`.
2. For each rule, it computes the appropriate clue value for each cell using the `colors` grid.
3. It builds a `Clue[][]` grid and attaches it in memory.

Example clue model:

```ts
type Clue =
  | { rule: RuleName; category: 'cell'; value: number; payload: { affectedCells: number[][] } }
  | { rule: RuleName; category: 'line'; value: number; payload: { lines: number[][][]; lineMatches: number[] } }
  | { rule: RuleName; category: 'board'; value: number; payload: { counts: Record<ColorKey, number> } }
```

Some future variants may store explicit `clues` to support custom rule types or mixed-rule puzzles.

---

## 6. Example JSON

```json
{
  "meta": {
    "rows": 6,
    "cols": 6,
    "palette": ["a", "b", "c"],
    "rules": ["neighbor"],
    "difficulty": "hard",
    "smooth": 0.4,
    "seed": 123,
    "generator": "deterministic-v1",
    "generated_utc": "2025-10-29T20:58:49+00:00",
    "initial_count": 7,
    "colors_sha1_12": "35f5c0c6f574"
  },
  "colors": [
    ["b", "b", "b", "b", "a", "c"],
    ["b", "b", "b", "b", "b", "c"],
    ["b", "b", "b", "b", "b", "b"],
    ["c", "b", "c", "c", "c", "b"],
    ["c", "b", "b", "c", "c", "b"],
    ["c", "b", "a", "b", "b", "b"]
  ],
  "initial": [
    [4, 4],
    [0, 4],
    [3, 4],
    [1, 5],
    [1, 1],
    [3, 0],
    [4, 1]
  ]
}
```

---
