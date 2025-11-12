import type { BoardFile, Clue, RuleName, ColorKey } from './types'

const inb = (r: number, c: number, R: number, C: number) => r >= 0 && c >= 0 && r < R && c < C

function neighbors8(r: number, c: number, R: number, C: number) {
  const out: number[][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue
      const rr = r + dr,
        cc = c + dc
      if (inb(rr, cc, R, C)) out.push([rr, cc])
    }
  }
  return out
}
function knightMoves(r: number, c: number, R: number, C: number) {
  const deltas = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ]
  const out: number[][] = []
  for (const [dr, dc] of deltas) {
    const rr = r + dr,
      cc = c + dc
    if (inb(rr, cc, R, C)) out.push([rr, cc])
  }
  return out
}

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
