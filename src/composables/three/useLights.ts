import { DirectionalLight, HemisphereLight } from 'three'

// Neutral, soft lighting so materials show their brand colors (see brand/BRAND.md §7).
// Lambert diffuse is color * irradiance / PI, so the total irradiance on an upward face
// (hemisphere sky + directional * cos) is tuned to ~PI: tops render at the exact color,
// faces toward the camera (+z) stay near full color and the rest fall off for depth.
const HEMISPHERE_INTENSITY = 1.9
const DIRECTIONAL_INTENSITY = 2.1

export default function useLights() {
  // * LIGHTS * //
  const directionalLight = new DirectionalLight( 0xffffff, DIRECTIONAL_INTENSITY )
  directionalLight.position.set( 0.5, 1.5, 2 )

  // Important for providing overall ambient light
  const hemisphereLight = new HemisphereLight( 0xffffff, 0x404040, HEMISPHERE_INTENSITY )

  return {
    directionalLight,
    hemisphereLight
  }
}
