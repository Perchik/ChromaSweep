import type { BoardFile, Clue, RuleName, ColorKey } from './types'
import { neighbors8, knightMoves } from './utils'

export function computeCluesFromColors(board: BoardFile): Clue[][] {
  const R = board.meta.rows,
    C = board.meta.cols
  const colors = board.colors as ColorKey[][]
  const ruleAt = (r: number, c: number): RuleName => {
    const ro = board.ruleOverrides?.find((x) => x.r === r && x.c === c)
    return ro?.rule ?? board.meta.defaultRule
  }
  const grid: Clue[][] = Array.from({ length: R }, () =>
    Array.from({ length: C }, () => null as any)
  )
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const my = colors[r][c]
      const rule = ruleAt(r, c)
      const coords = rule === 'neighbor' ? neighbors8(r, c, R, C) : knightMoves(r, c, R, C)
      let same = 0
      for (const [rr, cc] of coords) if (colors[rr][cc] === my) same++
      grid[r][c] = { rule, value: same }
    }
  }
  return grid
}
