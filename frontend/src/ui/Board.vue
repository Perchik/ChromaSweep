<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import Cell from './Cell.vue'
  const g = useGameController()
  const count = computed(() => g.rows.value * g.cols.value)
  const indices = computed(() => Array.from({ length: count.value }, (_, i) => i))
</script>

<template>
  <div
    class="board"
    :style="{ gridTemplateColumns: `repeat(${g.cols.value}, 1fr)` }"
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
    gap: 4px;
    padding: 16px;
  }
</style>
