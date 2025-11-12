<script setup lang="ts">
  import { useGameController } from '../core/useGame'
  const g = useGameController()
  function set(color: string) {
    g.activeColor.value = color
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
      :style="{ background: g.resolveColor(c) }"
      :aria-pressed="isActive(c)"
      :title="`Color ${c}`"
      @click="set(c)"
    />
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
