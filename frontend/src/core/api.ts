import type { BoardFile, Clue } from './types'
import { z } from 'zod'
import { computeCluesFromColors } from './computeClues'
import { ruleList } from './rules/catalog'
const BASE = import.meta.env.VITE_API_URL ?? ''

const ColorKey = z.enum(['a', 'b', 'c', 'd'])
const RuleName = z.enum(ruleList)
const RuleOverride = z.object({ r: z.number().int(), c: z.number().int(), rule: RuleName })

const BoardSchema = z.object({
  meta: z.object({
    rows: z.number().int().positive(),
    cols: z.number().int().positive(),
    palette: z.array(ColorKey).min(1),
    rules: z.array(z.string()),
    defaultRule: RuleName,
    difficulty: z.string(),
    smooth: z.number().optional(),
    seed: z.number().nullable().optional(),
    generator: z.string().optional(),
    generated_utc: z.string().optional(),
    initial_count: z.number().int().optional(),
    colors_sha1_12: z.string().optional(),
  }),
  colors: z.array(z.array(ColorKey)),
  ruleOverrides: z.array(RuleOverride).optional(),
  initial: z.array(z.tuple([z.number().int(), z.number().int()])),
})

async function fetchAndParse(url: string): Promise<BoardFile> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`)
  const json = await r.json()
  return BoardSchema.parse(json) as BoardFile
}

export async function fetchBoard(id?: string): Promise<BoardFile & { clues: Clue[][] }> {
  // Try API first if configured
  if (BASE) {
    try {
      const apiUrl = `${BASE}/api/board${id ? `/${id}` : ''}`
      const parsed = await fetchAndParse(apiUrl)
      const clues = computeCluesFromColors(parsed)
      return { ...parsed, clues }
    } catch (e) {
      console.warn('API fetch failed, trying local board...', e)
    }
  }
  // Fallback to local public file
  const localParsed = await fetchAndParse('/boards/board_001.json')
  const localClues = computeCluesFromColors(localParsed)
  return { ...localParsed, clues: localClues }
}

export async function fetchHint(payload: any) {
  if (!BASE) return { changed: false, state: payload?.state }
  const r = await fetch(`${BASE}/api/hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return r.json()
}
