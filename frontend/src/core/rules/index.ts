/* eslint-disable no-unused-vars */
import type { BoardFile, ColorKey, Clue, RuleName } from '../types'

export interface RuleContext {
  meta: BoardFile['meta']
  clues: Clue[][]
  getClue(_r: number, _c: number): Clue | null
  ruleAt(_r: number, _c: number): RuleName | null
  getColor(_r: number, _c: number): ColorKey | null
  setCertainColor(_r: number, _c: number, _color: ColorKey): void
  eliminateColor(_r: number, _c: number, _color: ColorKey): void
  inBounds(_r: number, _c: number): boolean
}

export interface RulePlugin {
  name: string
  propagate(_ctx: RuleContext, _r: number, _c: number): boolean
}

export const registry = new Map<string, RulePlugin>()
export const register = (p: RulePlugin) => {
  registry.set(p.name, p)
}
export const getRule = (n: string) => registry.get(n)
