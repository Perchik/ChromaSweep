<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import type { ColorKey, CellState, Clue, Mark } from '../core/types'

  const props = defineProps<{ r: number; c: number }>()

  const g = useGameController()

  // The underlying cell data for this (r, c)
  const cell = computed<CellState | null>(() => {
    return (g.grid.value[props.r]?.[props.c] as CellState | undefined) ?? null
  })

  // Clue for this cell, if any
  const clue = computed<Clue | null>(() => {
    const board = g.board.value as { clues?: Clue[][] } | null
    const clues = board?.clues
    return clues?.[props.r]?.[props.c] ?? null
  })

  // Palette order for quadrant badges
  const palette = computed<ColorKey[]>(() => {
    const board = g.board.value as { meta?: { palette?: ColorKey[] } } | null
    return board?.meta?.palette ?? []
  })

  // Cell fill color (fallback to CSS var for unsolved)
  const fill = computed(() => {
    const col = cell.value?.color ?? null
    return col ? g.styleFor(col).main : 'var(--unsolved)'
  })

  // Text color for clue
  const textFill = computed(() => {
    const col = cell.value?.color ?? null
    return col ? g.styleFor(col).fg : '#000000'
  })

  // Badge style per palette key
  function badgeStyle(k: ColorKey) {
    const c = cell.value
    const mark: Mark | undefined = c?.marks?.[k]
    const style = g.styleFor(k)

    if (!c || c.solved || !mark) {
      return {
        backgroundColor: 'transparent',
        color: style.main,
      }
    }

    if (mark === 'E') {
      // “E” = system/exact mark, solid badge
      return {
        backgroundColor: style.main,
        color: style.fg,
      }
    }

    // “O” / “X” = outline only, colored glyph
    return {
      backgroundColor: 'transparent',
      color: style.main,
    }
  }

  // Badge glyph for a given mark
  function badgeGlyph(k: ColorKey): string {
    const c = cell.value
    const mark: Mark | undefined = c?.marks?.[k]

    if (!c || c.solved || !mark) {
      // non-breaking space keeps layout stable
      return '\u00A0'
    }

    if (mark === 'O') return '⬤'
    if (mark === 'X') return '✕'
    if (mark === 'E') return '✕'

    return '\u00A0'
  }

  function onClick() {
    const col = g.activeColor.value
    if (col) g.fillCell(props.r, props.c, col)
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault()
    const col = g.activeColor.value
    if (col) g.toggleMark(props.r, props.c, col)
  }
</script>

<template>
  <div
    class="cell"
    role="button"
    tabindex="0"
    :aria-label="`Cell ${props.r},${props.c}`"
    @keydown="onKey"
    @click="onClick"
    @contextmenu="onContextMenu"
  >
    <div
      class="cell-inner"
      :class="{ unsolved: !cell?.solved }"
      :style="{ backgroundColor: fill }"
    >
      <!-- Clue, centered -->
      <div
        v-if="clue"
        class="clue"
        :style="{ color: textFill }"
      >
        {{ cell?.solved ? (clue.rule === 'knight' ? '♞' : clue.value) : '' }}
      </div>

      <!-- 2×2 quadrant grid for marks/badges -->
      <div
        v-if="palette.length"
        class="corner-grid"
      >
        <div
          v-for="k in palette"
          :key="k"
          class="corner-slot"
        >
          <div
            class="badge"
            :class="{ 'badge--active': !cell?.solved && !!cell?.marks?.[k] }"
            :style="badgeStyle(k)"
          >
            {{ badgeGlyph(k) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .cell {
    user-select: none;
    padding: 0;
    margin: 0;
    border: none;
    width: 100%;
    height: 100%;
  }

  .cell-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    overflow: hidden;
    box-sizing: border-box;
    border: 0.5px solid rgba(0, 0, 0, 0.3);
    transition:
      background-color 180ms ease-out,
      box-shadow 180ms ease-out;
  }

  .cell-inner.unsolved {
    box-shadow: inset 0 4px 2px rgba(0, 0, 0, 0.2);
  }

  .clue {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.4rem;
    font-weight: 700;
  }

  /* 2×2 grid overlay for quadrants */
  .corner-grid {
    position: absolute;
    inset: 2px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 3px;
    pointer-events: none;
  }

  .corner-slot {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .badge {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 800;
    font-size: 1.3rem;
    line-height: 1;

    opacity: 0;
    transform: scale(0.7);
    background-color: transparent;

    transition:
      opacity 100ms ease-out,
      background-color 160ms ease-out,
      color 160ms ease-out,
      transform 80ms ease-out,
      box-shadow 80ms ease-out;
  }

  .badge--active {
    opacity: 1;
    transform: scale(1);
  }
</style>
