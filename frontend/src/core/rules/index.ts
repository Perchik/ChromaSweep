/* eslint-disable no-unused-vars */
import type { BoardFile, Color } from '../types'

export interface RuleContext {
  meta: BoardFile['meta']
  // we'll compute clues elsewhere, rule impls can read via ctx.meta + external accessors
  getGuess(_r: number, _c: number): Color | null
  setCertainColor(_r: number, _c: number, _color: Color): void
  eliminateColor(_r: number, _c: number, _color: Color): void
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
