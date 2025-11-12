let _worker: Worker | null = null

function ensureWorker() {
  if (!_worker) {
    _worker = new Worker(new URL('./worker.entry.ts', import.meta.url), { type: 'module' })
  }
  return _worker
}

export function runPropagate(board: any, state: any): Promise<any> {
  const w = ensureWorker()
  return new Promise((resolve) => {
    const handler = (e: MessageEvent) => {
      w.removeEventListener('message', handler)
      resolve(e.data)
    }
    w.addEventListener('message', handler as any)
    w.postMessage({ board, state })
  })
}

export function disposeWorker() {
  if (_worker) {
    _worker.terminate()
    _worker = null
  }
}
