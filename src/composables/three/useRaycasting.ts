import { ref } from 'vue'
import { Raycaster, Vector2 } from "three"

export default function useRaycasting() {
  const raycasterRef = ref(new Raycaster());
  raycasterRef.value.layers.set(1)
  const mouseRef = ref(new Vector2());

  return {
    raycasterRef,
    mouseRef
  }
}