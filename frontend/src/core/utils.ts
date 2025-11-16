const inb = (r: number, c: number, R: number, C: number) => r >= 0 && c >= 0 && r < R && c < C

export function neighbors8(r: number, c: number, R: number, C: number) {
  const out: number[][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue
      const rr = r + dr,
        cc = c + dc
      if (inb(rr, cc, R, C)) out.push([rr, cc])
    }
  }
  return out
}

export function knightMoves(r: number, c: number, R: number, C: number) {
  const deltas = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ]
  const out: number[][] = []
  for (const [dr, dc] of deltas) {
    const rr = r + dr,
      cc = c + dc
    if (inb(rr, cc, R, C)) out.push([rr, cc])
  }
  return out
}
