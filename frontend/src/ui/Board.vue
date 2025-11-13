<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import Cell from './Cell.vue'
  const g = useGameController()
  const count = computed(() => g.rows.value * g.cols.value)
  const indices = computed(() => Array.from({ length: count.value }, (_, i) => i))
  const boardStyle = computed(() => {
    const active = g.activeColor.value
    const borderColor = active ? g.hexFor(active) : 'transparent'
    return {
      gridTemplateColumns: `repeat(${g.cols.value}, 64px)`,
      border: `6px solid ${borderColor}`
    }
  })
</script>

<template>
  <div
    class="board"
    :style="boardStyle"
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
    border-radius: 12px;
    box-sizing: border-box;
    transition: border-color 150ms ease;
  }
</style>
