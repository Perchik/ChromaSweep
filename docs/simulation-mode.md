# 🧪 Simulation Mode (Design Spec)

Simulation Mode is a non-destructive overlay system for Color Mines.  
It lets players explore hypothetical color assignments, marks, and notable cells (pins) without affecting the real puzzle state.

Think of it as laying tracing paper over the board.

---

## 1. Goals

- Allow players to experiment with assumptions ("What if these three cells are red?")
- Keep all simulation data completely separate from the base state
- Support multiple independent scenarios via layers
- Provide a scribbled "hand-drawn" aesthetic to distinguish sim content
- Keep controls simple and keyboard-friendly

---

## 2. Concept

- Up to **five** independent simulation layers: `Sim 1` … `Sim 5`
- Only **one active layer** at a time
- Each layer stores:
  - Hypothetical **fills**
  - **Pins** (bold outlines for notable cells)
  - Sim-layer **X/O marks**
- Simulation Mode can be toggled on/off at any time
- Turning Sim OFF leaves the base game exactly as it was

---

## 3. Data Model

```ts
export type SimLayerId = 1 | 2 | 3 | 4 | 5
export type RC = string // "r,c"
export type SimMark = 'X' | 'O'
export type ColorKey = 'a' | 'b' | 'c' | 'd'

export interface SimLayer {
  id: SimLayerId
  name: string                   // "Sim 1", "Sim 2", ...
  fills: Record<RC, ColorKey>    // Hypothetical color for each cell
  pins: Set<RC>                  // Pinned cells (bold outline)
  simMarks: Record<RC, Record<ColorKey, SimMark>>
}

export interface SimState {
  enabled: boolean               // Is Simulation Mode on?
  active: SimLayerId             // Which layer is visible/editable
  tool: 'fill' | 'pin' | 'mark'  // Current left-click tool
  layers: Record<SimLayerId, SimLayer>
}
```

All of this lives **outside** the main `CellState[][]` grid.

---

## 4. Tools & Interactions

### 4.1 Tools (left-click)

When Simulation Mode is ON, left-click uses the current tool:

| Tool   | Left-click Behavior                                                                 |
|--------|--------------------------------------------------------------------------------------|
| Fill   | Paint/erase hypothetical color for the active layer                                 |
| Pin    | Toggle bold outline (pin) on that cell                                              |
| Mark   | Cycle sim-layer mark for the active color: `null → X → O → null`                    |

### 4.2 Right-click

Right-click always cycles sim marks for the **active color**, regardless of the selected tool:

```text
null → X → O → null
```

This mirrors base-game right-click behavior, but operates in the sim layer only.

The browser context menu is suppressed when Simulation Mode is ON (`@contextmenu.prevent`).

---

## 5. Fill Tool Behavior (Toggle Logic)

The Fill tool provides smart toggling:

- If the clicked cell already has a sim fill **of the same color**, then:
  - Remove the sim fill
  - Remove any sim pin on that cell
- Else:
  - Set/replace the sim fill with the chosen color
  - If this is the **first fill** in an otherwise empty layer, auto-pin the cell

Pseudocode:

```ts
function fillSim(r: number, c: number, color: ColorKey) {
  const L = activeLayer()
  const key = `${r},${c}`
  const existing = L.fills[key]

  if (existing === color) {
    // Toggle off: remove fill AND pin
    delete L.fills[key]
    L.pins.delete(key)
    return
  }

  const wasEmptyLayer = Object.keys(L.fills).length === 0
  L.fills[key] = color
  if (wasEmptyLayer) L.pins.add(key) // auto-pin first fill
}
```

---

## 6. Pins

Pins act as visual anchors for "important" cells in a scenario.

- Toggled directly with the Pin tool
- Can exist with or without a fill
- When Fill toggles a color off for a cell, it also removes that cell's pin

Rendering: a bold, slightly irregular outline drawn over the cell, distinct from focus/selection.

---

## 7. Sim Marks

Sim-layer marks are analogous to base marks, but visually distinguished:

- Stored per cell per color:
  ```ts
  simMarks["r,c"][colorKey] = 'X' | 'O'
  ```
- Left-click with Mark tool or right-click with any tool cycles:
  ```text
  null → X → O → null
  ```
- Do not affect base marks; they are purely hypothetical annotations.

Visual style: smaller, handwriting-like glyphs, perhaps with a pencil color, so they read as "sketchy" rather than final.

---

## 8. Layer Management

### Sim ON/OFF

- When Sim is OFF:
  - Overlay is hidden
  - Base board behavior is normal (fills, marks, strikes, etc.)
- When Sim is ON:
  - Overlay for the active layer is shown
  - Base actions (validation, strikes, E marks) do **not** trigger
  - All clicks are interpreted as Simulation actions

### Switching Layers

- The active layer can be changed via toolbar or hotkeys (1–5).
- Only one layer is visible at a time.
- Each layer has independent fills, pins, and sim marks.

### Clear Layer

Clears all data from the current layer:

```ts
function clearActiveLayer() {
  const L = activeLayer()
  L.fills = {}
  L.pins = new Set()
  L.simMarks = {}
}
```

---

## 9. Rendering the Overlay

A `SimOverlay.vue` component is responsible for rendering a layer:

- It sits on top of `Board.vue`, sharing the same grid.
- For each `(r,c)`:
  - If `fills` has an entry for that cell, draw a semi-transparent, scribbled-style rect.
  - If `pins` contains the cell, draw a bold, rough outline.
  - If `simMarks` has marks for that cell, draw X/O glyphs in the corners.

### Visual Goals

- **Transparency:** underlying base cell (solved color and clue text) remains visible.
- **Style:** rough, pencil-like or marker-like, distinct from the polished base styling.
- **Readability:** clues must remain easily readable even when sim fills are present.

Z-order (bottom → top):

1. Base cell background (true color or unsolved)
2. Base marks & E marks
3. Sim fill (semi-transparent)
4. Sim pin outline
5. Sim marks (small, corner glyphs)
6. Base clue text (optionally ensure this is always on top for readability)

---

## 10. Toolbar & Hotkeys

### Toolbar Controls

- Sim toggle: **ON/OFF**
- Layer selector: **[1] [2] [3] [4] [5]**
- Tool selector: **Fill | Pin | Mark**
- Clear button: **Clear Layer**

### Keyboard Shortcuts (proposed)

- `S` → Toggle Simulation Mode
- `1–5` → Select sim layer 1–5
- `F` → Select Fill tool
- `P` → Select Pin tool
- `M` → Select Mark tool
- `Ctrl+Backspace` → Clear active layer

---

## 11. Persistence

Simulation layers can optionally be persisted per board:

- Key: `sim-${meta.colors_sha1_12}`
- Value: serialized `SimState` (excluding non-serializable `Set`, which can be converted to arrays)

On load:

1. Compute board hash from `meta.colors_sha1_12`.
2. Look for a saved `SimState` in localStorage.
3. Rehydrate `fills`, `pins`, and `simMarks` for each layer.

---

## 12. Integration with Main Game

When Simulation Mode is enabled:

- Base `fillCell` and `toggleMark` should be bypassed.
- Instead, UI should call `fillSim`, `togglePin`, and `cycleSimMark`.
- Strikes, E marks, and solver validation do not run.

This ensures Simulation Mode is purely hypothetical and cannot accidentally corrupt real game progress.

---

## 13. Future Enhancements

- **Apply Sim to Base:** Convert selected sim layer fills into real moves (with validation).
- **Compare Layers:** Show differences between layers (e.g., contradictions).
- **Simulation History:** Allow undo/redo within a sim layer.
- **Solver Integration:** Run propagation *assuming* sim fills as temporary givens.

---

This spec defines the behavior of Simulation Mode and its integration with the existing Color Mines architecture. It is designed to be incremental: you can first implement a single sim layer with basic fill/pin/mark, then add layers, persistence, and advanced visuals later.
