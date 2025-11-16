import type { Meta } from '../types'

export type RuleCategory = 'cell' | 'line' | 'board'

export interface RuleDefinition {
  name: string
  category: RuleCategory
  icon: string
  description: string
  getAffectedCells(meta: Meta, r: number, c: number): number[][]
}

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

export const ruleList = Object.freeze(['neighbor', 'knight'] as const)

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
}

export const ruleDefinitions = definitions
