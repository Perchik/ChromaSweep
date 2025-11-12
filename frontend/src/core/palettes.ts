export type PaletteKey = 'default' | 'sunset' | 'mono'
export type ColorKey = 'a' | 'b' | 'c' | 'd'

export const PALETTES: Record<PaletteKey, Record<ColorKey, string>> = {
  default: { a: '#e74c3c', b: '#27ae60', c: '#2980b9', d: '#f1c40f' },
  sunset: { a: '#ff6b6b', b: '#feca57', c: '#48dbfb', d: '#1dd1a1' },
  mono: { a: '#333333', b: '#666666', c: '#999999', d: '#cccccc' },
}

export const getColor = (palette: PaletteKey, key: ColorKey) =>
  PALETTES[palette]?.[key] ?? '#000000'
