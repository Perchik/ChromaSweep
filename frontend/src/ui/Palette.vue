<script setup lang="ts">
  import { useGameController } from '../core/useGame'
  const g = useGameController()
  function set(color: string) {
    g.activeColor.value = color as any
  }
  function isActive(color: string) {
    return g.activeColor.value === color
  }
</script>

<template>
  <div class="palette">
    <button
      v-for="c in g.board.value?.meta.palette || []"
      :key="c"
      :style="{
        background: g.styleFor(c).main,
        color: isActive(c) ? g.styleFor(c).fg : g.styleFor(c).fgDisabled,
        borderColor: isActive(c) ? '#222' : '#444',
      }"
      :aria-pressed="isActive(c)"
      :title="`Color ${c}`"
      @click="set(c)"
    >
      {{ c.toUpperCase() }}
    </button>

    <select
      v-model="g.theme"
      title="Theme"
    >
      <option value="default">Default</option>
      <option value="sunset">Sunset</option>
      <option value="mono">Mono</option>
    </select>
  </div>
</template>

<style scoped>
  .palette {
    display: flex;
    gap: var(--gap);
    align-items: center;
  }
  .palette button {
    min-width: 36px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid #444;
    cursor: pointer;
    font-weight: 600;
  }
</style>
