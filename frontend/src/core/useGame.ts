import { ref, computed } from 'vue'
import type { BoardWithClues, CellState, ColorKey, Mark, Tool } from './types'
import type { PaletteKey, ColorStyle } from './types'
import { getStyle } from './palettes'

const boardRef = ref<BoardWithClues | null>(null)
const gridRef = ref<CellState[][]>([])
const activeColorRef = ref<ColorKey | null>(null)
const activeToolRef = ref<Tool>('fill')
const strikesRef = ref(0)
const wonRef = ref(false)
const themeRef = ref<PaletteKey>('default')

const MAX_STRIKES = 3 as const

export function useGameController() {
  const rows = computed(() => boardRef.value?.meta.rows ?? 0)
  const cols = computed(() => boardRef.value?.meta.cols ?? 0)

  function loadBoard(bf: BoardWithClues) {
    const grid: CellState[][] = Array.from({ length: bf.meta.rows }, () =>
      Array.from({ length: bf.meta.cols }, () => ({ marks: {} }) as CellState)
    )
    for (const [r, c] of bf.initial) {
      grid[r][c].revealed = true
      // Revealed cells show the true color and are solved immediately
      const trueColor = bf.colors[r][c]
      grid[r][c].color = trueColor
      grid[r][c].solved = true
    }
    boardRef.value = bf
    gridRef.value = grid
    activeColorRef.value = bf.meta.palette[0] ?? null
    strikesRef.value = 0
    wonRef.value = isBoardSolved()
    activeToolRef.value = 'fill'
  }

  function setActiveTool(tool: Tool) {
    activeToolRef.value = tool
  }

  function setTheme(name: PaletteKey) {
    themeRef.value = name
  }

  function styleFor(key: ColorKey): ColorStyle {
    return getStyle(themeRef.value, key)
  }
  function hexFor(key: ColorKey): string {
    return styleFor(key).main
  }

  /** Toggles the X or O mark. */
  function toggleMark(r: number, c: number, color: ColorKey, mark: Mark) {
    const cell = gridRef.value[r][c]
    const marks = { ...(cell.marks ?? {}) }
    if (marks[color] === 'E') return // system mark is immutable
    if (marks[color] === mark) marks[color] = null
    else marks[color] = mark

    gridRef.value[r][c] = { ...cell, marks }
  }

  /** User toggles mark on a color for this cell. Never writes/overrides 'E'. */
  function cycleMark(r: number, c: number, color: ColorKey) {
    const cell = gridRef.value[r][c]
    const prev = (cell.marks ?? {})[color] ?? null
    if (prev === 'E') return // system mark is immutable
    let next: Mark
    if (prev === null) next = 'X'
    else if (prev === 'X') next = 'O'
    else if (prev === 'O') next = null
    else next = prev
    toggleMark(r, c, color, next)
  }

  /** Place a system error mark for an attempted wrong color. */
  function setWrongGuess(r: number, c: number, colorTried: ColorKey) {
    const cell = gridRef.value[r][c]
    const marks = { ...(cell.marks ?? {}) }
    marks[colorTried] = 'E'
    gridRef.value[r][c] = { ...cell, marks }
  }

  /** Immediate validation: only correct color can be filled; wrong adds E + strike. */
  function fillCell(r: number, c: number, color: ColorKey) {
    if (!boardRef.value) return
    const trueColor = boardRef.value.colors[r][c]
    const cell = gridRef.value[r][c]

    // Don't allow edits of revealed/solved cells
    if (cell.solved) return

    if (color === trueColor) {
      revealCell(r, c)
    } else {
      strikesRef.value = Math.min(MAX_STRIKES, strikesRef.value + 1)
      setWrongGuess(r, c, color) // keep color empty on wrong try
    }
  }

  function revealCell(r: number, c: number) {
    if (!boardRef.value) return
    const trueColor = boardRef.value.colors[r][c]
    const cell = gridRef.value[r][c]
    gridRef.value[r][c] = {
      ...cell,
      color: trueColor,
      solved: true,
      marks: {},
    }
    if (isBoardSolved()) wonRef.value = true
  }

  function clickCell(r: number, c: number) {
    if (gridRef.value[r][c]?.solved) {
      activeColorRef.value = gridRef.value[r][c].color as ColorKey
      return
    }

    const tool = activeToolRef.value
    const color = activeColorRef.value
    if (!color) return

    switch (tool) {
      case 'fill':
        fillCell(r, c, color)
        break
      case 'mark-x':
        toggleMark(r, c, color, 'X')
        break
      case 'mark-o':
        toggleMark(r, c, color, 'O')
        break
      case 'reveal':
        revealCell(r, c)
        break
    }
  }

  function doubleClickCell(r: number, c: number) {
    const board = boardRef.value
    const cell = gridRef.value[r]?.[c]
    if (!board || !cell?.revealed || !cell.solved || !cell.color) {
      return
    }

    const clue = board.clues?.[r]?.[c] ?? null
    const affected = clue?.affectedCells ?? []
    if (!affected.length) return

    const color = cell.color as ColorKey
    affected.forEach(([rr, cc]) => {
      const neighbor = gridRef.value[rr]?.[cc]
      if (!neighbor || neighbor.solved) return
      const currentMark = neighbor.marks?.[color] ?? null
      if (currentMark === 'X') return
      toggleMark(rr, cc, color, 'X')
    })
  }

  function isBoardSolved(): boolean {
    if (!boardRef.value) return false
    for (let r = 0; r < boardRef.value.meta.rows; r++) {
      for (let c = 0; c < boardRef.value.meta.cols; c++) {
        const solved = gridRef.value[r][c]?.solved === true
        if (!solved) return false
      }
    }
    return true
  }

  function resetProgress() {
    if (!boardRef.value) return
    loadBoard(boardRef.value)
  }

  return {
    board: boardRef,
    grid: gridRef,
    activeColor: activeColorRef,
    activeTool: activeToolRef,
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
    cycleMark,
    setActiveTool,
    clickCell,
    doubleClickCell,
  }
}
