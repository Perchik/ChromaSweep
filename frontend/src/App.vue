<script setup lang="ts">
  import Board from './ui/Board.vue'
  import Palette from './ui/Palette.vue'
  import Toolbar from './ui/Toolbar.vue'
  import ToolSelector from './ui/ToolSelector.vue'
  import { computed, onMounted, ref } from 'vue'
  import { useGameController } from './core/useGame'
  import { fetchBoard } from './core/api'

  const g = useGameController()
  const loading = ref(true)
  const err = ref<string | null>(null)

  const frameStyle = computed(() => {
    const active = g.activeColor.value
    return {
      borderColor: active ? g.hexFor(active) : 'transparent',
    }
  })

  onMounted(async () => {
    try {
      const board = await fetchBoard()
      g.loadBoard(board)
    } catch (e: any) {
      err.value = `Failed to load board: ${e?.message ?? e}`
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <main class="container">
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

    <section
      v-else
      class="workspace"
    >
      <Toolbar class="toolbar" />
      <div
        class="board-frame"
        :style="frameStyle"
      >
        <Board />
        <div class="toolset">
          <ToolSelector />
          <Palette />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .workspace {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .toolbar {
    align-self: stretch;
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  .board-frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: max-content;
    gap: 20px;
    padding: 40px;
    border: 20px solid;
    border-bottom-width: 60px;
    border-radius: 16px;
    transition: border-color 0.3s ease;
  }
  .toolset {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
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
