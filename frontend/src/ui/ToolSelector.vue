<script setup lang="ts">
  import { useGameController } from '../core/useGame'

  const g = useGameController()
  const tools = [
    { key: 'fill' as const, label: 'Fill' },
    { key: 'mark-x' as const, label: 'Mark X' },
    { key: 'mark-o' as const, label: 'Mark O' }
  ]

  function selectTool(tool: (typeof tools)[number]['key']) {
    g.setActiveTool(tool)
  }
</script>

<template>
  <div class="tool-selector">
    <div class="tool-group">
      <button
        v-for="tool in tools"
        :key="tool.key"
        type="button"
        class="tool-button"
        :class="{ active: g.activeTool.value === tool.key }"
        :aria-pressed="g.activeTool.value === tool.key"
        @click="selectTool(tool.key)"
      >
        {{ tool.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  .tool-selector {
    display: flex;
    justify-content: center;
    margin: 8px 0 16px;
  }

  .tool-group {
    display: inline-flex;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 999px;
  }

  .tool-button {
    appearance: none;
    border: 1px solid transparent;
    background: transparent;
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .tool-button:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  .tool-button.active {
    background: #1c7ed6;
    border-color: #1971c2;
    color: white;
  }
</style>
