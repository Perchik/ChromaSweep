<script setup lang="ts">
  import Board from './ui/Board.vue'
  import Palette from './ui/Palette.vue'
  import Toolbar from './ui/Toolbar.vue'
  import { onMounted, ref } from 'vue'
  import { useGameController } from './core/useGame'
  import { fetchBoard } from './core/api'

  const g = useGameController()
  const loading = ref(true)
  const err = ref<string | null>(null)

  onMounted(async () => {
    try {
      const board = await fetchBoard()
      g.loadBoard(board)
    } catch (e: any) {
      console.error('Failed to load board from API, falling back to local file...', e)
      err.value = e?.message ?? String(e)
      try {
        const r = await fetch('/boards/board_001.json')
        const json = await r.json()
        g.loadBoard(json as any)
      } catch (e2: any) {
        err.value = `Fallback failed: ${e2?.message ?? e2}`
      }
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <main class="container">
    <header>
      <h1>Color Mines (Vue)</h1>
    </header>

    <section
      v-if="loading"
      class="loading"
    >
      <p>Loading board…</p>
    </section>

    <section
      v-else-if="err"
      class="error"
    >
      <p>
        <strong>Couldn’t load from API.</strong>
        {{ err }}
      </p>
      <p>
        Check that the FastAPI server is running or that
        <code>.env.local</code>
        is unset for local file mode.
      </p>
    </section>

    <template v-else>
      <section class="controls">
        <Palette />
        <Toolbar />
      </section>
      <Board />
    </template>
  </main>
</template>

<style scoped>
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
  }
  .controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 12px;
  }
  .loading,
  .error {
    padding: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .error {
    background: #fff3f3;
    border-color: #f5c2c2;
  }
</style>
