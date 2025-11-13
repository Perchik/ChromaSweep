<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import Cell from './Cell.vue'
  const g = useGameController()
  const count = computed(() => g.rows.value * g.cols.value)
  const indices = computed(() => Array.from({ length: count.value }, (_, i) => i))

  const rows = g.rows.value
  const cols = g.cols.value
</script>

<template>
  <div
    class="board"
    :style="{
      '--rows': rows,
      '--cols': cols,
      '--cell-size': '64px',
    }"
  >
    <Cell
      v-for="i in indices"
      :key="`${Math.floor(i / g.cols.value)}-${i % g.cols.value}`"
      :r="Math.floor(i / g.cols.value)"
      :c="i % g.cols.value"
    />
  </div>
</template>

<style scoped>
  .board {
    display: grid;
    grid-template-columns: repeat(var(--cols), var(--cell-size));
    grid-template-rows: repeat(var(--rows), var(--cell-size));
    gap: 6px;
  }
</style>
