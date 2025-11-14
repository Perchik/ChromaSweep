import { ref, computed } from 'vue'
import type { BoardFile, CellState, ColorKey, Mark } from './types'
import type { PaletteKey, ColorStyle } from './types'
import { getStyle } from './palettes'

const boardRef = ref<BoardFile | null>(null)
const gridRef = ref<CellState[][]>([])
const activeColorRef = ref<ColorKey | null>(null)
const strikesRef = ref(0)
const wonRef = ref(false)
const themeRef = ref<PaletteKey>('default')

const MAX_STRIKES = 3 as const

export function useGameController() {
  const rows = computed(() => boardRef.value?.meta.rows ?? 0)
  const cols = computed(() => boardRef.value?.meta.cols ?? 0)

  function loadBoard(bf: BoardFile) {
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

  /** User toggles mark on a color for this cell. Never writes/overrides 'E'. */
  function toggleMark(r: number, c: number, color: ColorKey) {
    const cell = gridRef.value[r][c]
    const prev = (cell.marks ?? {})[color] ?? null
    if (prev === 'E') return // system mark is immutable
    let next: Mark
    if (prev === null) next = 'X'
    else if (prev === 'X') next = 'O'
    else if (prev === 'O') next = null
    else next = prev
    const marks = { ...(cell.marks ?? {}) }
    marks[color] = next
    gridRef.value[r][c] = { ...cell, marks }
  }

  /** Place a system error mark for an attempted wrong color. */
  function setWrongGuess(r: number, c: number, colorTried: ColorKey) {
    const cell = gridRef.value[r][c]
    const marks = { ...(cell.marks ?? {}) }
    marks[colorTried] = 'E'
    gridRef.value[r][c] = { ...cell, marks, wrong: true }
  }

  /** Immediate validation: only correct color can be filled; wrong adds E + strike. */
  function fillCell(r: number, c: number, color: ColorKey) {
    if (!boardRef.value) return
    const trueColor = boardRef.value.colors[r][c]
    const cell = gridRef.value[r][c]

    // Don't allow edits of revealed/solved cells
    if (cell.solved) return

    if (color === trueColor) {
      gridRef.value[r][c] = {
        ...cell,
        color,
        solved: true,
        wrong: false,
        marks: {}, // clear marks on correct solve,
      }
      if (isBoardSolved()) wonRef.value = true
    } else {
      strikesRef.value = Math.min(MAX_STRIKES, strikesRef.value + 1)
      setWrongGuess(r, c, color) // keep color empty on wrong try
    }
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
    toggleMark,
  }
}
