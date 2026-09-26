import { computed } from 'vue'
import { Vector3, BoxGeometry, MeshStandardMaterial, Mesh } from 'three'

export default function useFacilityModel(width: number, height: number, depth: number, name: string, isWireframe: boolean) {
  // Setup Facility Dimensions
  const facilityWidth = width as number
  const facilityHeight = height
  const facilityDepth = depth as number
  
  // Setup Facility Positioning
  const facilityPosition = computed(() => {
    return new Vector3(0, facilityHeight/2, 0)
  })
  // Setup Facility Material 
  const facilityMaterial = computed(() => {
    return {
      color: 0x000000,
      wireframe: isWireframe,
      transparent: !isWireframe,
      opacity: 0.0
    }
  })
  // Setup Facility Mesh Object
  const facGeo = new BoxGeometry(facilityWidth, facilityHeight, facilityDepth)
  const facMat = new MeshStandardMaterial(facilityMaterial.value)
  const facilityModel = new Mesh(facGeo, facMat)
  facilityModel.name = name
  facilityModel.position.copy(facilityPosition.value)
  facilityModel.layers.set(0)

  return facilityModel 
}