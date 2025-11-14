<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import Cell from './Cell.vue'
  import ToolSelector from './ToolSelector.vue'
  import Palette from './Palette.vue'
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
    const active = g.activeColor.value

    return {
      // grid size
      gridTemplateColumns: `repeat(${cols}, 64px)`,
      gridTemplateRows: `repeat(${rows}, 64px)`,

      // dynamic border color
      borderColor: active ? g.hexFor(active) : 'transparent',
    }
  })
</script>

<template>
  <div
    class="container"
    :style="{ borderColor: boardStyle.borderColor }"
  >
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

    <ToolSelector />
    <Palette />
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: max-content;
    gap: 20px;
    padding: 40px;
    border: 20px solid;
    border-bottom-width: 60px;
    border-radius: 16px;
    transition: border-color 0.3s ease;
  }

  .board {
    display: grid;
    gap: 8px;
    width: max-content; /* keep the grid tight */
  }

  .tool-overlay {
    margin-top: 16px;
  }
</style>
