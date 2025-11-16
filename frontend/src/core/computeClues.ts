import type { BoardFile, Clue, RuleName, ColorKey } from './types'
import { ruleDefinitions } from './rules/catalog'

export function computeCluesFromColors(board: BoardFile): Clue[][] {
  const R = board.meta.rows
  const C = board.meta.cols
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
      const definition = ruleDefinitions[rule]
      if (!definition) {
        throw new Error(`Unknown rule definition for "${rule}"`)
      }
      const coords = definition.getAffectedCells(board.meta, r, c)
      let same = 0
      for (const [rr, cc] of coords) if (colors[rr][cc] === my) same++
      grid[r][c] = { rule, value: same }
    }
  }
  return grid
}
