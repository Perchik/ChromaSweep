import type { ColorKey, ColorStyle, PaletteKey } from './types'

const cs = (key: ColorKey, main: string, fg?: string, fgDisabled?: string): ColorStyle => {
  if (!fg || !fgDisabled) {
    ;({ fg, fgDisabled } = contrastText(main))
  }
  return { key, main, fg, fgDisabled }
}

export const PALETTES: Record<PaletteKey, Record<ColorKey, ColorStyle>> = {
  default: {
    a: cs('a', '#e74c3c'), // red
    b: cs('b', '#27ae60'), // green
    c: cs('c', '#2980b9'), // blue
    d: cs('d', '#f1c40f', '#1a1a1a', '#1a1a1a88'), // yellow uses dark fg
  },
  sunset: {
    a: cs('a', '#ff6b6b'),
    b: cs('b', '#feca57', '#1a1a1a', '#1a1a1a88'),
    c: cs('c', '#48dbfb', '#0c1b2a', '#0c1b2a88'),
    d: cs('d', '#1dd1a1'),
  },
  mono: {
    a: cs('a', '#333333'),
    b: cs('b', '#666666'),
    c: cs('c', '#999999', '#111111', '#11111166'),
    d: cs('d', '#cccccc', '#111111', '#11111166'),
  },
}

function contrastText(hex: string): { fg: string; fgDisabled: string } {
  const [r, g, b] = hex.match(/\w\w/g)!.map((c) => parseInt(c, 16) / 255)
  const srgb = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
  const fg = luminance > 0.5 ? '#000000' : '#ffffff'
  return { fg, fgDisabled: `${fg}88` }
}

/** Get the full style object for a color key in a given palette */
export const getStyle = (palette: PaletteKey, key: ColorKey): ColorStyle =>
  PALETTES[palette]?.[key] ?? cs(key, '#000000', '#ffffff', '#ffffff88')
