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

  const CORNERS: Record<string, { x: number; y: number; anchor: string }> = {
    a: { x: 12, y: 18, anchor: 'start' },
    b: { x: 88, y: 18, anchor: 'end' },
    c: { x: 12, y: 90, anchor: 'start' },
    d: { x: 88, y: 90, anchor: 'end' },
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
  >
    <svg
      viewBox="0 0 100 100"
      class="wh"
    >
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="8"
        class="cell-rect"
        :style="{ fill }"
      />
      <text
        v-if="clue"
        x="50"
        y="58"
        text-anchor="middle"
        font-size="42"
        font-weight="700"
        :fill="textFill"
      >
        {{ cell.solved ? (clue.rule === 'knight' ? '♞' : clue.value) : '' }}
      </text>

      <!-- Corner marks (X/O/E) -->
      <g v-if="g.board.value">
        <template
          v-for="k in g.board.value.meta.palette"
          :key="k"
        >
          <template v-if="cell?.marks?.[k]">
            <rect
              v-if="cell.marks[k] === 'E'"
              :x="CORNERS[k].anchor === 'start' ? CORNERS[k].x - 8 : CORNERS[k].x - 20"
              :y="CORNERS[k].y - 14"
              rx="3"
              width="24"
              height="18"
              fill="#e03131"
              opacity="0.95"
            />
            <text
              :x="CORNERS[k].x"
              :y="CORNERS[k].y"
              :text-anchor="CORNERS[k].anchor"
              font-size="14"
              font-weight="800"
              :fill="
                cell.marks[k] === 'E'
                  ? '#000000'
                  : cell.marks[k] === 'X'
                    ? '#cc0000'
                    : g.styleFor(k).fg
              "
            >
              {{ cell.marks[k] === 'O' ? 'O' : '×' }}
            </text>
          </template>
        </template>
      </g>
    </svg>
  </div>
</template>

<style scoped>
  .cell {
    user-select: none;
    padding: 0;
    margin: 0;
    border: none; /* unless intentional */
  }

  .wh {
    width: 100%;
    height: 100%;
  }
</style>
