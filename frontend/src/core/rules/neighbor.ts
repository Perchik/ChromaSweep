import type { RulePlugin } from './index'

export const NeighborRule: RulePlugin = {
  name: 'neighbor',
  propagate(ctx, r, c) {
    const clue = ctx.getClue(r, c)
    if (!clue || clue.rule !== 'neighbor') return false
    // Conservative placeholder: no mutation yet.
    // TODO: implement safe deductions (e.g., if player's guess here is X and value=0 -> eliminate X from neighbors)
    return false
  },
}
