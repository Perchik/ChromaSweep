/// <reference lib="webworker" />
import { propagateAll } from './propagate'
import type { BoardFile, ColorKey, ClueGrid } from '../types'
import type { RuleContext } from '../rules'

type BoardWithClues = BoardFile & { clues?: ClueGrid }

function buildContext(board: BoardWithClues, state: any): RuleContext {
  const meta = board.meta
  const getColor = (r: number, c: number): ColorKey | null => state.grid?.[r]?.[c]?.color ?? null
  const setCertainColor = (r: number, c: number, color: ColorKey) => {
    state.grid[r][c] = { ...(state.grid[r][c] || {}), color, solved: true }
  }
  const eliminateColor = (r: number, c: number, color: ColorKey) => {
    const cell = state.grid[r][c] || {}
    const marks = { ...(cell.marks || {}) }
    // don't override system 'E' here; just set X if not already E
    if (marks[color] !== 'E') marks[color] = 'X'
    state.grid[r][c] = { ...cell, marks }
  }
  const inBounds = (r: number, c: number) => r >= 0 && c >= 0 && r < meta.rows && c < meta.cols
  const fallbackClues: ClueGrid = Array.from({ length: meta.rows }, () =>
    Array.from({ length: meta.cols }, () => null)
  )
  return {
    meta,
    getColor,
    setCertainColor,
    eliminateColor,
    inBounds,
    clues: board.clues ?? fallbackClues,
  }
}

self.onmessage = (e: MessageEvent) => {
  const { board, state } = e.data as { board: BoardWithClues; state: any }
  const ctx = buildContext(board, state)
  const changed = propagateAll(board, ctx)
  ;(self as any).postMessage({ changed, state })
}
