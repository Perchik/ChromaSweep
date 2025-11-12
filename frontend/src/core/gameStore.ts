import { defineStore } from 'pinia'
import type { BoardFile, CellState, Color, ColorKey } from './types'
import type { PaletteKey } from './palettes'
import { getColor } from './palettes'

export const useGame = defineStore('game', {
  state: () => ({
    board: null as BoardFile | null,
    grid: [] as CellState[][],
    activeColor: null as Color | null,
    strikes: 0,
    won: false,
    theme: 'default' as PaletteKey,
  }),
  getters: {
    rows: (s) => s.board?.meta.rows ?? 0,
    cols: (s) => s.board?.meta.cols ?? 0,
  },
  actions: {
    loadBoard(bf: BoardFile) {
      const grid = Array.from({ length: bf.meta.rows }, () =>
        Array.from({ length: bf.meta.cols }, () => ({ marks: {} }) as CellState)
      )
      for (const [r, c] of bf.initial) grid[r][c].revealed = true
      this.board = bf
      this.grid = grid
      this.activeColor = bf.meta.palette[0] ?? null
      this.strikes = 0
      this.won = false
    },
    setTheme(name: PaletteKey) {
      this.theme = name
    },
    resolveColor(key: string) {
      return getColor(this.theme, key as ColorKey)
    },
    fillCell(r: number, c: number, color: Color) {
      const cell = this.grid[r][c]
      this.grid[r][c] = { ...cell, guess: color }
    },
    setMark(r: number, c: number, color: Color, mark: 'X' | 'O' | null) {
      const cell = this.grid[r][c]
      const marks = { ...(cell.marks ?? {}) }
      marks[color] = mark
      this.grid[r][c] = { ...cell, marks }
    },
    resetProgress() {
      if (!this.board) return
      this.loadBoard(this.board)
    },
  },
})
