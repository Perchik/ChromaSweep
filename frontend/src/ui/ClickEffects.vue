<!-- ClickEffects.vue -->
<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useGameController } from '../core/useGame'

  type Tool = 'fill' | 'mark-x' | 'mark-o' | 'reveal'
  type PulseKind = 'press' | 'single' | 'double'
  type Shape = 'square' | 'circle' | 'x'

  interface Ripple {
    id: number
    x: number
    y: number
    kind: PulseKind
    shape: Shape
    color: string
  }

  const g = useGameController()
  const ripples = ref<Ripple[]>([])
  let counter = 0

  // -------- X polygon geometry (rotated +, proper 90° bars) --------

  function makeXPolygonPoints(options?: {
    halfLength?: number // bar half-length (arms)
    halfThickness?: number // bar half-thickness
    size?: number // viewBox size (e.g. 100)
    margin?: number // inset from edges
  }) {
    const H = options?.halfLength ?? 1
    const T = options?.halfThickness ?? 0.35
    const size = options?.size ?? 100
    const margin = options?.margin ?? 0

    // Outline of an axis-aligned plus shape (p,q)
    const verts: [number, number][] = [
      [-H, -T],
      [-T, -T],
      [-T, -H],
      [T, -H],
      [T, -T],
      [H, -T],
      [H, T],
      [T, T],
      [T, H],
      [-T, H],
      [-T, T],
      [-H, T],
    ]

    const s = Math.SQRT1_2 // 1 / √2

    // After rotation, max radius from center is (H+T)/√2
    const R = s * (H + T)

    const usable = size - 2 * margin
    const scale = usable / (2 * R)

    const cx = size / 2
    const cy = size / 2

    const points = verts.map(([p, q]) => {
      // rotate +45°
      const x = (p - q) * s
      const y = (p + q) * s

      const X = cx + x * scale
      const Y = cy + y * scale

      return `${X.toFixed(3)},${Y.toFixed(3)}`
    })

    return points.join(' ')
  }

  // Tunable X shape
  const X_POINTS = makeXPolygonPoints({
    halfLength: 1, // how far arms extend
    halfThickness: 0.18, // thickness of the crossbars
    size: 100,
    margin: 8,
  })

  // ---------------- ripple plumbing ----------------

  interface ActivePress {
    id: number
    startX: number
    startY: number
    dragged: boolean
  }
  const activePresses = new Map<number, ActivePress>()

  function shapeForTool(tool: Tool | null | undefined): Shape {
    if (tool === 'fill') return 'square'
    if (tool === 'mark-o') return 'circle'
    if (tool === 'mark-x') return 'x'
    return 'circle'
  }

  function colorForActive(): string {
    const key = g.activeColor.value
    if (!key) return '#888'
    return g.hexFor(key)
  }

  function removeRipple(id: number) {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }

  // shared helper: spawn a double pulse, optionally forcing shape
  function spawnDoubleRipple(x: number, y: number, shape?: Shape) {
    const id = counter++
    ripples.value.push({
      id,
      x,
      y,
      kind: 'double',
      shape: shape ?? shapeForTool(g.activeTool.value),
      color: colorForActive(),
    })
    setTimeout(() => removeRipple(id), 600)
  }

  // ---------------- event handlers ----------------

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return // left only

    const id = counter++
    ripples.value.push({
      id,
      x: e.clientX,
      y: e.clientY,
      kind: 'press',
      shape: shapeForTool(g.activeTool.value),
      color: colorForActive(),
    })

    activePresses.set(e.pointerId, {
      id,
      startX: e.clientX,
      startY: e.clientY,
      dragged: false,
    })
  }

  function handlePointerMove(e: PointerEvent) {
    const press = activePresses.get(e.pointerId)
    if (!press || press.dragged) return

    const dx = e.clientX - press.startX
    const dy = e.clientY - press.startY
    const dist = Math.hypot(dx, dy)

    if (dist > 6) {
      press.dragged = true
      removeRipple(press.id)
    }
  }

  function handlePointerUp(e: PointerEvent) {
    const press = activePresses.get(e.pointerId)
    if (!press) return

    activePresses.delete(e.pointerId)

    if (press.dragged) return

    const idx = ripples.value.findIndex((r) => r.id === press.id)
    if (idx === -1) return

    const r = ripples.value[idx]
    ripples.value.splice(idx, 1, { ...r, kind: 'single' })

    setTimeout(() => removeRipple(r.id), 600)
  }

  function handlePointerCancel(e: PointerEvent) {
    const press = activePresses.get(e.pointerId)
    if (!press) return
    activePresses.delete(e.pointerId)
    removeRipple(press.id)
  }

  // double-click: double pulse in current tool’s shape
  function handleDoubleClick(e: MouseEvent) {
    spawnDoubleRipple(e.clientX, e.clientY)
  }

  // right-click: always X double pulse
  function handleContextMenu(e: MouseEvent) {
    e.preventDefault() // suppress browser menu
    spawnDoubleRipple(e.clientX, e.clientY, 'x')
  }

  // ---------------- lifecycle ----------------

  onMounted(() => {
    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('pointermove', handlePointerMove, true)
    window.addEventListener('pointerup', handlePointerUp, true)
    window.addEventListener('pointercancel', handlePointerCancel, true)
    window.addEventListener('dblclick', handleDoubleClick, true)
    window.addEventListener('contextmenu', handleContextMenu, true)
  })

  onUnmounted(() => {
    window.removeEventListener('pointerdown', handlePointerDown, true)
    window.removeEventListener('pointermove', handlePointerMove, true)
    window.removeEventListener('pointerup', handlePointerUp, true)
    window.removeEventListener('pointercancel', handlePointerCancel, true)
    window.removeEventListener('dblclick', handleDoubleClick, true)
    window.removeEventListener('contextmenu', handleContextMenu, true)
  })
</script>

<template>
  <div class="click-layer">
    <div
      v-for="r in ripples"
      :key="r.id"
      class="ripple"
      :class="[r.shape, r.kind]"
      :style="{
        top: r.y + 'px',
        left: r.x + 'px',
        '--ripple-color': r.color,
      }"
      @animationend="removeRipple(r.id)"
    >
      <!-- X Outline -->
      <svg
        v-if="r.shape === 'x'"
        viewBox="0 0 100 100"
        class="x-outline"
      >
        <polygon
          :points="X_POINTS"
          fill="none"
          stroke="var(--ripple-color)"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
  .click-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 99999;
  }

  .ripple {
    position: fixed;
    pointer-events: none;
    transform-origin: center;
    opacity: 0.8;
  }

  /* Square outline */
  .ripple.square {
    width: 20px;
    height: 20px;
    margin-left: -10px;
    margin-top: -10px;
    border: 2px solid var(--ripple-color);
    border-radius: 4px;
  }

  /* Circle outline */
  .ripple.circle {
    width: 20px;
    height: 20px;
    margin-left: -10px;
    margin-top: -10px;
    border: 2px solid var(--ripple-color);
    border-radius: 50%;
  }

  /* X outline container */
  .ripple.x {
    width: 28px;
    height: 28px;
    margin-left: -14px;
    margin-top: -14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .x-outline {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* Animations */
  .ripple.press {
    animation: none;
  }

  .ripple.single {
    animation: ripple-tap 0.2s ease-out;
  }

  .ripple.double {
    animation: ripple-burst 0.35s ease-out;
  }

  @keyframes ripple-tap {
    from {
      opacity: 0.9;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(1.8);
    }
  }

  @keyframes ripple-burst {
    0% {
      opacity: 0.9;
      transform: scale(0.7);
    }
    60% {
      opacity: 0.4;
      transform: scale(2.4);
    }
    100% {
      opacity: 0;
      transform: scale(3.2);
    }
  }
</style>
