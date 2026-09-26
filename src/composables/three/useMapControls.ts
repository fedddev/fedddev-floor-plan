import { ref } from "vue";
import { PerspectiveCamera, OrthographicCamera, MathUtils } from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

export default function useMapControls(
  camera: OrthographicCamera | PerspectiveCamera,
  canvas: HTMLElement
) {
  const cameraControlsRef = ref(new MapControls(camera, canvas));
  // * PERSPECTIVE CAMERA - MAP CONTROLS * //
  if (camera.type === "PerspectiveCamera") {
    cameraControlsRef.value.enableDamping = true;
    cameraControlsRef.value.dampingFactor = 0.05;
    cameraControlsRef.value.screenSpacePanning = false;
    cameraControlsRef.value.minDistance = 0.1;
    cameraControlsRef.value.maxDistance = 1000;
    cameraControlsRef.value.enableRotate = true;
    cameraControlsRef.value.enablePan = true;
    // Added in minPolarAngle and set maxPolarAngle to 89 so that the floor is always somewhat seen (0 to 89)
    cameraControlsRef.value.minPolarAngle = MathUtils.degToRad(0);
    cameraControlsRef.value.maxPolarAngle = MathUtils.degToRad(89);
  } else if (camera.type === "OrthographicCamera") {
    cameraControlsRef.value.enableDamping = true;
    cameraControlsRef.value.dampingFactor = 0.05;
    cameraControlsRef.value.screenSpacePanning = false;
    cameraControlsRef.value.minDistance = 0.1;
    cameraControlsRef.value.maxDistance = 1000;
    cameraControlsRef.value.enableRotate = false;
    cameraControlsRef.value.enablePan = true;
  }

  return cameraControlsRef;
}
