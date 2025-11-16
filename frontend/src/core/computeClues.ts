import type { BoardFile, Clue, RuleName, ColorKey } from './types'
import { ruleDefinitions } from './rules/catalog'

type BoardWideCache = Map<RuleName, Clue>

const ALL_COLOR_KEYS: ColorKey[] = ['a', 'b', 'c', 'd']

const countMatches = (colors: ColorKey[][], coords: number[][], color: ColorKey) =>
  coords.reduce((count, [rr, cc]) => count + (colors[rr][cc] === color ? 1 : 0), 0)

const allBoardCells = (meta: BoardFile['meta']): number[][] => {
  const coords: number[][] = []
  for (let r = 0; r < meta.rows; r++) {
    for (let c = 0; c < meta.cols; c++) {
      coords.push([r, c])
    }
  }
  return coords
}

const tallyBoardColors = (_meta: BoardFile['meta'], colors: ColorKey[][]) => {
  const counts: Record<ColorKey, number> = Object.fromEntries(
    ALL_COLOR_KEYS.map((key) => [key, 0])
  ) as Record<ColorKey, number>
  for (let r = 0; r < colors.length; r++) {
    for (let c = 0; c < colors[r].length; c++) {
      const color = colors[r][c]
      counts[color] = (counts[color] ?? 0) + 1
    }
  }
  return counts
}

function createClue(
  board: BoardFile,
  colors: ColorKey[][],
  rule: RuleName,
  r: number,
  c: number,
  cache: BoardWideCache
): Clue {
  const definition = ruleDefinitions[rule]
  if (!definition) throw new Error(`Unknown rule definition for "${rule}"`)
  const color = colors[r][c]
  const base = { rule, value: 0 }

  if (definition.category === 'cell') {
    const coords = definition.getAffectedCells(board.meta, r, c)
    const same = countMatches(colors, coords, color)
    return {
      ...base,
      category: definition.category,
      value: same,
      affectedCells: coords,
      payload: { color },
    }
  }

  if (definition.category === 'line') {
    const lines = definition.getLines(board.meta, r, c)
    const lineMatches = lines.map((line) => countMatches(colors, line, color))
    const affectedCells = lines.flat()
    return {
      ...base,
      category: definition.category,
      value: lineMatches.reduce((sum, next) => sum + next, 0),
      affectedCells,
      payload: { color, lines, lineMatches },
    }
  }

  if (!cache.has(rule)) {
    const value = definition.evaluateBoard(board.meta, colors)
    const affectedCells = allBoardCells(board.meta)
    cache.set(rule, {
      ...base,
      category: definition.category,
      value,
      affectedCells,
      payload: {
        counts: tallyBoardColors(board.meta, colors),
      },
    })
  }
  return cache.get(rule) as Clue
}

const ruleAt = (board: BoardFile, r: number, c: number): RuleName => {
  const ro = board.ruleOverrides?.find((x) => x.r === r && x.c === c)
  return ro?.rule ?? board.meta.defaultRule
}

export function computeCluesFromColors(board: BoardFile): Clue[][] {
  const R = board.meta.rows
  const C = board.meta.cols
  const colors = board.colors as ColorKey[][]
  const grid: Clue[][] = Array.from({ length: R }, () =>
    Array.from({ length: C }, () => null as any)
  )
  const boardCache: BoardWideCache = new Map()
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const rule = ruleAt(board, r, c)
      grid[r][c] = createClue(board, colors, rule, r, c, boardCache)
    }
  }
  return grid
}
