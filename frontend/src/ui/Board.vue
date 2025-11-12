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
    :style="{ gridTemplateColumns: `repeat(${g.cols}, 1fr)` }"
  >
    <Cell
      v-for="i in indices"
      :key="`${Math.floor(i / g.cols)}-${i % g.cols}`"
      :r="Math.floor(i / g.cols)"
      :c="i % g.cols"
    />
  </div>
</template>

<style scoped>
  .board {
    display: grid;
    gap: var(--gap);
    padding: 16px;
  }
</style>
