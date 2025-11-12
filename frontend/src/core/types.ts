export type ColorKey = 'a' | 'b' | 'c' | 'd'
export type RuleName = 'neighbor' | 'knight'

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

export interface Clue {
  rule: RuleName
  value: number
}

export interface BoardFile {
  meta: Meta
  colors: ColorKey[][]
  ruleOverrides?: RuleOverride[]
  initial: [number, number][]
}
