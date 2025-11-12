import { registry } from '../rules'
import type { BoardFile } from '../types'
import type { RuleContext, RulePlugin } from '../rules'

export function propagateAll(board: BoardFile, ctx: RuleContext): boolean {
  let changed = false
  const { rows, cols } = board.meta
  const active: RulePlugin[] = board.meta.rules
    .map((n) => registry.get(n))
    .filter((p): p is RulePlugin => Boolean(p))

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const rule of active) if (rule.propagate(ctx, r, c)) changed = true
    }
  }
  return changed
}
