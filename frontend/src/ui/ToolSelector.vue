<script setup lang="ts">
  import { computed } from 'vue'
  import { useGameController } from '../core/useGame'
  import { TOOL_OPTIONS, type ToolOption, type Tool } from '../core/types'

  const g = useGameController()
  const toolOptions: ToolOption[] = TOOL_OPTIONS

  function selectTool(tool: Tool) {
    g.setActiveTool(tool)
  }

  // Background + foreground colors based on active color
  const toolbarBg = computed(() => {
    const col = g.activeColor.value
    return col ? g.styleFor(col).main : '#222222'
  })

  const toolbarFg = computed(() => {
    const col = g.activeColor.value
    return col ? g.styleFor(col).fg : '#f5f5f5'
  })
</script>

<template>
  <div
    class="tool-selector"
    :style="{ backgroundColor: toolbarBg, color: toolbarFg }"
  >
    <button
      v-for="opt in toolOptions"
      :key="opt.tool"
      type="button"
      class="tool-button"
      :class="{ active: g.activeTool.value === opt.tool }"
      :style="g.activeTool.value === opt.tool ? { color: toolbarBg } : { color: toolbarFg }"
      :title="opt.label"
      @click="selectTool(opt.tool)"
    >
      <span class="icon">{{ opt.icon }}</span>
    </button>
  </div>
</template>

<style scoped>
  .tool-selector {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem; /* more space between icons */
    padding: 0.5rem 0.75rem; /* bigger, less cramped */
    border-radius: 8px;
    /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); */
  }

  /* base button styling */
  .tool-button {
    border: none;
    background: transparent;
    padding: 0.35rem 0.7rem; /* bigger click target */
    border-radius: 8px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 1.5rem; /* larger symbols */
    line-height: 1;
    color: inherit;

    transition:
      background 0.12s ease,
      color 0.12s ease,
      transform 0.06s ease;
  }

  .tool-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .tool-button:active {
    transform: scale(0.95);
  }

  /* active tool highlight */
  .tool-button.active {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
  }

  /* tweak icon alignment if needed */
  .icon {
    display: inline-block;
    transform: translateY(1px);
  }
</style>
