<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import Cell from './Cell.vue'
  const g = useGameController()

  const cells = computed(() => {
    const rows = g.rows.value
    const cols = g.cols.value
    const total = rows * cols

    return Array.from({ length: total }, (_, i) => ({
      row: Math.floor(i / cols),
      col: i % cols,
    }))
  })

  const boardStyle = computed(() => {
    const rows = g.rows.value
    const cols = g.cols.value

    return {
      // grid size
      gridTemplateColumns: `repeat(${cols}, 64px)`,
      gridTemplateRows: `repeat(${rows}, 64px)`,
    }
  })
</script>

<template>
  <div
    class="board"
    :style="boardStyle"
  >
    <Cell
      v-for="cell in cells"
      :key="`${cell.row}-${cell.col}`"
      :r="cell.row"
      :c="cell.col"
    />
  </div>
</template>

<style scoped>
  .board {
    display: grid;
    gap: 8px;
    width: max-content; /* keep the grid tight */
  }
</style>
