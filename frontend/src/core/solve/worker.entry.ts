/// <reference lib="webworker" />
import { propagateAll } from './propagate'
import type { BoardFile, Color } from '../types'
import type { RuleContext } from '../rules'

function buildContext(board: BoardFile, state: any): RuleContext {
  const meta = board.meta
  const getGuess = (r: number, c: number): Color | null => state.grid?.[r]?.[c]?.guess ?? null
  const setCertainColor = (r: number, c: number, color: Color) => {
    // set a deterministic guess in-place to keep worker idempotent
    state.grid[r][c] = { ...(state.grid[r][c] || {}), guess: color }
  }
  const eliminateColor = (r: number, c: number, color: Color) => {
    // record an elimination by attaching/maintaining a marks map; this will be read by UI later
    const cell = state.grid[r][c] || {}
    const marks = { ...(cell.marks || {}) }
    // mark 'X' against that color to indicate elimination
    marks[color] = 'X'
    state.grid[r][c] = { ...cell, marks }
  }
  const inBounds = (r: number, c: number) => r >= 0 && c >= 0 && r < meta.rows && c < meta.cols
  return { meta, getGuess, setCertainColor, eliminateColor, inBounds }
}

self.onmessage = (e: MessageEvent) => {
  const { board, state } = e.data as { board: BoardFile; state: any }
  const ctx = buildContext(board, state)
  const changed = propagateAll(board, ctx)
  ;(self as any).postMessage({ changed, state })
}
