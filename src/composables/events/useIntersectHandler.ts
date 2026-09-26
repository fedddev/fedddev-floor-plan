import { Ref } from "vue";
import { Scene, Intersection, InstancedMesh } from "three";
import { CabinetSpace } from "@models/cabinetSpace";

export default function useIntersectHandler(
  event: MouseEvent,
  raycasterRef: Ref,
  webGLScene: Scene,
  cabinets: CabinetSpace[],
  selectedCabinets: Ref,
  selectedCabinetPoints: Ref,
  clearCabinetSelection: VoidFunction
) {
  event.preventDefault();
  // Find intersections.
  let intersects = raycasterRef.value.intersectObjects(
    webGLScene.children,
    true
  ) as Intersection[];
  if (intersects.length > 0) {
    // Console logging the array of intersections.
    for (const intersect of intersects) {
      if (intersect.object instanceof InstancedMesh) {
        if (selectedCabinets.value.length) {
          clearCabinetSelection();
        }
        selectedCabinets.value?.push(cabinets[intersect.instanceId!]);
        selectedCabinetPoints.value?.push(intersect.point);
        break;
      }
      intersects = [];
    }
  }
}
