import type { BoardFile, Clue, RuleName, ColorKey, ClueGrid, RuleCell } from './types'
import { neighbors8, knightMoves } from './utils'
const inb = (r: number, c: number, R: number, C: number) => r >= 0 && c >= 0 && r < R && c < C

export function computeCluesFromColors(board: BoardFile): ClueGrid {
  const R = board.meta.rows,
    C = board.meta.cols
  const colors = board.colors as ColorKey[][]
  const grid: ClueGrid = Array.from({ length: R }, () => Array.from({ length: C }, () => null))

  const targets = board.clueCells ?? []

  for (const { r, c, rule } of targets) {
    if (!inb(r, c, R, C)) continue
    const my = colors[r][c]
    const coords = rule === 'neighbor' ? neighbors8(r, c, R, C) : knightMoves(r, c, R, C)
    let same = 0
    for (const [rr, cc] of coords) if (colors[rr][cc] === my) same++
    grid[r][c] = { rule, value: same }
  }
  return grid
}
