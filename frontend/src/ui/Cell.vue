<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'

  const props = defineProps<{ r: number; c: number }>()
  const g = useGameController()
  const cell = computed(() => g.grid.value[props.r]?.[props.c])
  const clue = computed(() => (g as any).board.value?.clues[props.r][props.c] ?? null)

  const fill = computed(() => {
    const col = cell.value?.color
    return col ? g.styleFor(col).main : 'var(--unsolved)'
  })
  const textFill = computed(() => {
    const col = cell.value?.color
    return col ? g.styleFor(col).fg : '#000000'
  })

  function onClick() {
    const tool = g.activeTool.value
    const col = g.activeColor.value
    if (tool === 'fill') {
      if (col) g.fillCell(props.r, props.c, col)
    } else if (tool === 'mark-x') {
      g.setActiveColorMark(props.r, props.c, 'X')
    } else if (tool === 'mark-o') {
      g.setActiveColorMark(props.r, props.c, 'O')
    }
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
      <div
        v-if="clue"
        class="clue"
        :style="{ color: textFill }"
      >
        {{ cell.solved ? (clue.rule === 'knight' ? '♞' : clue.value) : '' }}
      </div>

      <!-- 2×2 quadrant grid for marks/badges -->
      <div
        v-if="g.board.value"
        class="corner-grid"
      >
        <template
          v-for="k in g.board.value.meta.palette"
          :key="k"
        >
          <div class="corner-slot">
            <div
              class="badge"
              :class="{ 'badge--active': !cell.solved && cell?.marks?.[k] }"
              :style="{
                backgroundColor: cell?.marks?.[k] === 'E' ? g.styleFor(k).main : 'transparent',
                color: cell?.marks?.[k] === 'E' ? g.styleFor(k).fg : g.styleFor(k).main,
              }"
            >
              {{
                !cell.solved && cell?.marks?.[k]
                  ? cell.marks[k] === 'O'
                    ? '⬤'
                    : '✕'
                  : ' ' /* dummy char, hidden when inactive */
              }}
            </div>
          </div>
        </template>
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

    transition:
      background-color 180ms ease-out,
      box-shadow 180ms ease-out;
  }

  .cell-inner.unsolved {
    box-shadow: inset 2px 2px 3px rgba(0, 0, 0, 0.2);
  }
  /* Clue centered in the cell */
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
    inset: 4px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 3px;

    pointer-events: none; /* so clicks still hit the cell */
  }

  /* one slot per quadrant (TL, TR, BL, BR in source order) */
  .corner-slot {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* the actual colored badge, centered in its quadrant */
  .badge {
    width: 100%;
    height: 100%;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.3rem;

    /* default “hidden” state */
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

  /* when that quadrant has a mark */
  .badge--active {
    opacity: 1;
    transform: scale(1);
  }
</style>
