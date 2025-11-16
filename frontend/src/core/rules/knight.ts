import type { RulePlugin } from './index'

export const KnightRule: RulePlugin = {
  name: 'knight',
  propagate(ctx, r, c) {
    const clue = ctx.getClue(r, c)
    if (!clue || clue.rule !== 'knight') return false
    // Conservative placeholder: no mutation yet.
    return false
  },
}
