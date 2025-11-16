// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `npm run generate:rules` from the frontend workspace to regenerate.

import type { RuleCategory } from './types'

export interface SharedRuleMetadata {
  name: string
  category: RuleCategory
  icon: string
  description: string
}

export const sharedRuleMetadata = Object.freeze([
  {
    name: 'neighbor',
    category: 'cell',
    icon: '⬢',
    description: 'Counts same-color neighbors in the surrounding 8 cells.',
  },
  {
    name: 'knight',
    category: 'cell',
    icon: '♞',
    description: 'Counts same-color cells a knight move away (chess knight).',
  },
  {
    name: 'row',
    category: 'line',
    icon: '↔',
    description: 'Reports same-color counts along the clue’s row and column.',
  },
  {
    name: 'global-balance',
    category: 'board',
    icon: 'Σ',
    description: 'Evaluates the difference between the most and least common colors.',
  }
] as const satisfies readonly SharedRuleMetadata[])

export const ruleList = Object.freeze([
  'neighbor',
  'knight',
  'row',
  'global-balance',
] as const)

export type RuleName = (typeof ruleList)[number]
