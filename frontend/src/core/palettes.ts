import type { ColorKey, ColorStyle, PaletteKey } from './types'

const cs = (key: ColorKey, main: string, fg = '#ffffff', fgDisabled = '#ffffff88'): ColorStyle => ({
  key, main, fg, fgDisabled
})

export const PALETTES: Record<PaletteKey, Record<ColorKey, ColorStyle>> = {
  default: {
    a: cs('a', '#e74c3c'),                         // red
    b: cs('b', '#27ae60'),                         // green
    c: cs('c', '#2980b9'),                         // blue
    d: cs('d', '#f1c40f', '#1a1a1a', '#1a1a1a88')  // yellow uses dark fg
  },
  sunset: {
    a: cs('a', '#ff6b6b'),
    b: cs('b', '#feca57', '#1a1a1a', '#1a1a1a88'),
    c: cs('c', '#48dbfb', '#0c1b2a', '#0c1b2a88'),
    d: cs('d', '#1dd1a1')
  },
  mono: {
    a: cs('a', '#333333'),
    b: cs('b', '#666666'),
    c: cs('c', '#999999', '#111111', '#11111166'),
    d: cs('d', '#cccccc', '#111111', '#11111166')
  }
}

/** Get the full style object for a color key in a given palette */
export const getStyle = (palette: PaletteKey, key: ColorKey): ColorStyle =>
  PALETTES[palette]?.[key] ?? cs(key, '#000000', '#ffffff', '#ffffff88')
