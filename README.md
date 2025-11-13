# 🎨 Color Mines

Color Mines is a multi-color logic puzzle inspired by Minesweeper and Obto.  
Each puzzle is a grid of hidden colors (a/b/c/d). Clues describe how many
same-color neighbors satisfy a rule (Neighbor, Knight, Row, etc.). The player
deduces all colors using logic, marks, and validation.

A Vue 3 + TypeScript app provides the interactive frontend, while a Python
generator + solver (optional during development) creates and checks puzzles.

---

## 🚀 Features

- Multiple rule types (Neighbor, Knight, extensible)
- SVG-based board rendering
- X/O/E marks, strike system, automatic validation
- "Blink-to-remove-X" input UX
- Vue 3 Composition API architecture
- Web Worker rule propagation support
- Planned: five-layer Simulation Mode
- Planned: hint engine & daily puzzles

---

## 🏗 Project Structure

```text
frontend/
  src/
    core/
      useGame.ts
      api.ts
      types.ts
      palettes.ts
      rules/
      solve/
    ui/
      Board.vue
      Cell.vue
      Palette.vue
      Toolbar.vue
    App.vue
    main.ts
  public/
    boards/
      board_001.json
backend/
  generator/
  solver/
docs/
  architecture.md
  state-model.md
  web-workers.md
  data-format.md
  simulation-mode.md
```

---

## 🛠 Running the Frontend

```sh
cd frontend
npm install
npm run dev
```

The app loads from `/public/boards/board_001.json` unless a Python API is enabled.

---

## 🧠 Documentation

- [Architecture Overview](docs/architecture.md)
- [State Model](docs/state-model.md)
- [Web Worker Propagation](docs/web-workers.md)
- [Board JSON Specification](docs/data-format.md)
- [Simulation Mode Design](docs/simulation-mode.md)

---
