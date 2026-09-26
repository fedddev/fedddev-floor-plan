import { Vector2 } from "three"

export default function useMouseMove(element: HTMLElement, mouse: Vector2) {
  element.addEventListener('mousemove', (event: MouseEvent) => {
    mouse.x = (event.offsetX / element.clientWidth) * 2 - 1
    mouse.y = - (event.offsetY / element.clientHeight) * 2 + 1
  })
}