<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  const props = defineProps<{ r: number; c: number }>()
  const g = useGameController()
  const cell = computed(() => g.grid.value[props.r]?.[props.c])
  const clue = computed(() => (g as any).board.value?.clues[props.r][props.c] ?? null)
  const fill = computed(() => {
    const guess = cell.value?.guess
    if (!guess) return 'var(--unsolved)'
    return g.resolveColor(guess)
  })
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
      >
        {{ clue.rule === 'knight' ? '♞' : clue.value }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
  .cell {
    width: 64px;
    height: 64px;
    user-select: none;
  }
  .wh {
    width: 100%;
    height: 100%;
  }
</style>
