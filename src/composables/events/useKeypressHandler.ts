import { Ref } from 'vue'
import { Mesh, SphereGeometry, MeshBasicMaterial, TextureLoader, BackSide, Scene, SRGBColorSpace } from 'three'
import { publicUrl } from '@/utilities/publicUrl'

const SPACE_NAME = 'space'
// The star texture is almost all black with faint grey points (they were lifted by the old
// exposure-12 tone mapping) - multiply so the stars read without tone mapping
const STAR_BRIGHTNESS = 4

// Star sphere around the facility: created on first use, then shown/hidden
function toggleSpace(webGLScene: Scene) {
  const existing = webGLScene.getObjectByName(SPACE_NAME)
  if (existing) {
    existing.visible = !existing.visible
    return
  }
  const starTexture = new TextureLoader().load(publicUrl('space.png'))
  starTexture.colorSpace = SRGBColorSpace
  const starMaterial = new MeshBasicMaterial({
    map: starTexture,
    side: BackSide,
    toneMapped: false,
  })
  starMaterial.color.setScalar(STAR_BRIGHTNESS)
  const space = new Mesh(new SphereGeometry(500, 64, 64), starMaterial)
  space.name = SPACE_NAME
  space.layers.set(0)
  webGLScene.add(space)
}

export default function useKeypressHandler(event: KeyboardEvent, isOrtho: Ref<boolean>, activeCameraRef: Ref, webGLScene: Scene) {
    // v for view
    if (event.key === 'v') {
      isOrtho.value = !isOrtho.value
    // t for pods
    } else if (event.key === 't') {
      // Layers enabled on Camera and Layers set on each Pod model
      activeCameraRef.value.layers.toggle(2)
    // u for universe - toggle the star sphere
    } else if (event.key === 'u') {
      toggleSpace(webGLScene)
    }
}
