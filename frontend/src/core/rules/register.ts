import { register } from './index'
import { NeighborRule } from './neighbor'
import { KnightRule } from './knight'

export function registerRules() {
  register(NeighborRule)
  register(KnightRule)
}
