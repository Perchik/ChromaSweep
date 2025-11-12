import { storeToRefs } from 'pinia'
import { useGame } from './gameStore'
export function useGameController() {
  const s = useGame()
  return { ...storeToRefs(s), ...s }
}
