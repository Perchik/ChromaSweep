<script setup lang="ts">
  import { useGameController } from '../core/useGame'
  import { runPropagate } from '../core/solve/worker'
  const g = useGameController()
  async function magic() {
    if (!g.board.value) return
    const state = { grid: g.grid.value }
    const res = await runPropagate(g.board.value, state)
    g.grid.value = res.state.grid
  }
  function restart() {
    g.resetProgress()
  }
</script>

<template>
  <div class="toolbar">
    <button @click="magic">Magic</button>
    <button @click="restart">Restart</button>
  </div>
</template>
