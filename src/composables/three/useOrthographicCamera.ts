import { OrthographicCamera, Vector3 } from 'three'

// Fit the camera's frustum and zoom to the facility - call again once facility dimensions are known
export function frameOrthographicCamera( orthoCamera: OrthographicCamera, facilityWidth: number, facilityDepth: number, canvasWidth: number, canvasHeight: number ) {
  const aspectRatio = canvasWidth / canvasHeight // aspectRatio of the viewport

  const viewportHeight = facilityDepth // set viewportHeight to the facilityHeight to guarantee facilities will never be clipped vertically, if facility is taller than wide - the entire facility will always be visible
  const viewportWidth = facilityDepth*aspectRatio // derive viewportWidth from facilityDepth and aspectRatio - this is to maintain proper proportions
  const zoomWidth = facilityWidth // zoomWidth is used to guarantee that entire facilityWidth is visible upon initial load
  const zoomHeight = zoomWidth/aspectRatio // zoomHeight is derived from facilityWidth and aspectRatio

  // Set camera's frustrum using viewport's initial height and width to ensure that entire facility's height is visible and the view has proper aspectRatio/facility proportions
  orthoCamera.left = viewportWidth / -2
  orthoCamera.right = viewportWidth / 2
  orthoCamera.top = viewportHeight / 2
  orthoCamera.bottom = viewportHeight / -2
  // * Zoom out to fit entire facility's width in view * //
  // change zoom only if zoomHeight is greater than viewportHeight, otherwise stay at default zoom
  // if so, divide initialZoomFactor by the percentage of difference between zoomHeight and viewportHeight
  const initialZoomFactor = zoomHeight > viewportHeight ? viewportHeight/zoomHeight : 1 // initialize to default THREE.js OrthographicCamera zoom factor, which is 1
  orthoCamera.position.copy(new Vector3(0, orthoCamera.far/2, 0)) // guarantees that OrthographicCamera is in an optimal viewing location
  // set orthoCamera zoom to initialZoomFactor to ensure than entire facility's width is in view
  orthoCamera.zoom = initialZoomFactor
  orthoCamera.lookAt(0, 0, 0)
  orthoCamera.updateProjectionMatrix()
}

export default function useOrthographicCamera( facilityWidth: number, facilityDepth: number, canvasWidth: number, canvasHeight: number ) {
  /* CAMERA - Orthographic (orthoCamera = Secondary) */
  const near = 0.1 // Near clipping plane
  const far = 500 // Far clipping plane

  const orthoCamera = new OrthographicCamera(-1, 1, 1, -1, near, far)
  frameOrthographicCamera(orthoCamera, facilityWidth, facilityDepth, canvasWidth, canvasHeight)
  orthoCamera.layers.enable(0)
  orthoCamera.layers.enable(1)
  orthoCamera.layers.enable(2)

  orthoCamera.name = 'orthoCamera'

  return orthoCamera
}
