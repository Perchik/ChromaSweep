export type ColorKey = 'a' | 'b' | 'c' | 'd'
export type RuleName = 'neighbor' | 'knight'

export interface RuleCell {
  r: number
  c: number
  rule: RuleName
}

export interface ColorStyle {
  key: ColorKey
  main: string
  fg: string
  fgDisabled: string
}

export type PaletteKey = 'default' | 'sunset' | 'mono'

export interface Meta {
  rows: number
  cols: number
  palette: ColorKey[]
  rules: string[]
  difficulty: string
  smooth?: number
  seed?: number | null
  generator?: string
  generated_utc?: string
  initial_count?: number
  colors_sha1_12?: string
}

export interface Clue {
  rule: RuleName
  value: number
}

export type ClueGrid = (Clue | null)[][]

export interface BoardFile {
  meta: Meta
  colors: ColorKey[][]
  clueCells?: RuleCell[]
  initial: [number, number][]
}

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
