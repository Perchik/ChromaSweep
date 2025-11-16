import type { RuleName } from './rules/catalog'
export type { RuleCategory } from './rules/catalog'

export type ColorKey = 'a' | 'b' | 'c' | 'd'

export type PaletteKey = 'default' | 'sunset' | 'mono'

export type { RuleName }

export interface ColorStyle {
  key: ColorKey
  main: string
  fg: string
  fgDisabled: string
}

export interface Meta {
  rows: number
  cols: number
  palette: ColorKey[]
  rules: string[]
  defaultRule: RuleName
  difficulty: string
  smooth?: number
  seed?: number | null
  generator?: string
  generated_utc?: string
  initial_count?: number
  colors_sha1_12?: string
}

export interface RuleOverride {
  r: number
  c: number
  rule: RuleName
}
interface BaseClue {
  rule: RuleName
  category: RuleCategory
  value: number
}

export interface CellClue extends BaseClue {
  category: 'cell'
  payload: {
    color: ColorKey
    affectedCells: number[][]
  }
}

export interface LineClue extends BaseClue {
  category: 'line'
  payload: {
    color: ColorKey
    lines: number[][][]
    lineMatches: number[]
  }
}

export interface BoardClue extends BaseClue {
  category: 'board'
  payload: {
    counts: Record<ColorKey, number>
  }
}

export type Clue = CellClue | LineClue | BoardClue

export interface BoardFile {
  meta: Meta
  colors: ColorKey[][]
  ruleOverrides?: RuleOverride[]
  initial: [number, number][]
}

export type BoardWithClues = BoardFile & { clues: Clue[][] }

export type Mark = 'X' | 'O' | 'E' | null

export interface CellState {
  /** The visible/confirmed color once solved. */
  color?: ColorKey | null
  /** True if this cell has been solved by the player (or was revealed). */
  solved?: boolean
  /** User & system per-color marks. 'E' is system error and cannot be removed. */
  marks?: Partial<Record<ColorKey, Mark>>
  /** Was part of initial reveal. */
  revealed?: boolean
}

export type Tool = 'fill' | 'mark-x' | 'mark-o' | 'reveal'

export interface ToolOption {
  tool: Tool
  icon: string
  label: string
}

export const TOOL_OPTIONS: ToolOption[] = [
  { tool: 'fill', icon: '⏹', label: 'Fill' },
  { tool: 'mark-x', icon: '✖', label: 'Mark X' },
  { tool: 'mark-o', icon: '⬤', label: 'Mark O' },
  { tool: 'reveal', icon: '⯌', label: 'Reveal' },
]
