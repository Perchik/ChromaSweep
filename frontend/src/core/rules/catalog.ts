import type { ColorKey, Meta } from '../types'

export type RuleCategory = 'cell' | 'line' | 'board'

interface BaseRuleDefinition {
  name: string
  category: RuleCategory
  icon: string
  description: string
}

export interface CellRuleDefinition extends BaseRuleDefinition {
  category: 'cell'
  getAffectedCells(meta: Meta, r: number, c: number): number[][]
}

export interface LineRuleDefinition extends BaseRuleDefinition {
  category: 'line'
  getLines(meta: Meta, r: number, c: number): number[][][]
}

export interface BoardRuleDefinition extends BaseRuleDefinition {
  category: 'board'
  evaluateBoard(meta: Meta, colors: ColorKey[][]): number
}

export type RuleDefinition =
  | CellRuleDefinition
  | LineRuleDefinition
  | BoardRuleDefinition

const inBounds = (meta: Meta, r: number, c: number) =>
  r >= 0 && c >= 0 && r < meta.rows && c < meta.cols

const neighbors8 = (meta: Meta, r: number, c: number) => {
  const out: number[][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue
      const rr = r + dr
      const cc = c + dc
      if (inBounds(meta, rr, cc)) out.push([rr, cc])
    }
  }
  return out
}

const knightMoves = (meta: Meta, r: number, c: number) => {
  const deltas = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ] as const

  const out: number[][] = []
  for (const [dr, dc] of deltas) {
    const rr = r + dr
    const cc = c + dc
    if (inBounds(meta, rr, cc)) out.push([rr, cc])
  }
  return out
}

const rowAndColumnLines = (meta: Meta, r: number, c: number) => {
  const row: number[][] = []
  const column: number[][] = []
  for (let cc = 0; cc < meta.cols; cc++) row.push([r, cc])
  for (let rr = 0; rr < meta.rows; rr++) column.push([rr, c])
  return [row, column]
}

const evaluateGlobalBalance = (meta: Meta, colors: ColorKey[][]) => {
  const counts: Partial<Record<ColorKey, number>> = {}
  for (let r = 0; r < meta.rows; r++) {
    for (let c = 0; c < meta.cols; c++) {
      const color = colors[r][c]
      counts[color] = (counts[color] ?? 0) + 1
    }
  }
  const values = Object.values(counts)
  if (!values.length) return 0
  return Math.max(...values) - Math.min(...values)
}

export const ruleList = Object.freeze(
  ['neighbor', 'knight', 'row', 'global-balance'] as const
)

export type RuleName = (typeof ruleList)[number]

const definitions: Record<RuleName, RuleDefinition> = {
  neighbor: {
    name: 'neighbor',
    category: 'cell',
    icon: '⬢',
    description: 'Counts same-color neighbors in the surrounding 8 cells.',
    getAffectedCells: neighbors8,
  },
  knight: {
    name: 'knight',
    category: 'cell',
    icon: '♞',
    description: 'Counts same-color cells a knight move away (chess knight).',
    getAffectedCells: knightMoves,
  },
  row: {
    name: 'row',
    category: 'line',
    icon: '↔',
    description: 'Reports same-color counts along the clue’s row and column.',
    getLines: rowAndColumnLines,
  },
  'global-balance': {
    name: 'global-balance',
    category: 'board',
    icon: 'Σ',
    description:
      'Evaluates the difference between the most and least common colors.',
    evaluateBoard: evaluateGlobalBalance,
  },
}

export const ruleDefinitions = definitions
