import { PerspectiveCamera } from 'three'

// Position the camera for a starting overview of the facility - call again once facility dimensions are known
export function framePerspectiveCamera(perspCamera: PerspectiveCamera, facilityWidth: number) {
  // starting position
  const z = Math.tan(30 * Math.PI/180) * facilityWidth
  const y = Math.tan(20 * Math.PI/180) * z
  perspCamera.position.set(0, y, z)
  perspCamera.lookAt(0, 0 ,0)
  perspCamera.updateProjectionMatrix()
}

export default function usePerspectiveCamera(facilityWidth: number, width: number, height: number) {
  /* CAMERA - Perspective (cameraPersp = Primary) */
  const fov = 50 // Field of view --- lower to reduce distortion
  const aspectRatio = width / height
  const near = 0.1 // Near clipping plane
  const far = 1500 // Far clipping plane
  const perspCamera = new PerspectiveCamera(fov, aspectRatio, near, far)

  framePerspectiveCamera(perspCamera, facilityWidth)
  perspCamera.layers.enable(0)
  perspCamera.layers.enable(1)
  perspCamera.layers.enable(2)

  perspCamera.name = "perspCamera"

  return perspCamera
}
