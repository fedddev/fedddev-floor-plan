import {
  TextureLoader,
  PlaneGeometry,
  ShaderMaterial,
  DoubleSide,
  Mesh,
  MathUtils,
  Color,
  SRGBColorSpace,
  Vector3,
} from "three";
import type { SceneTheme } from "@/utilities/brandColors";
import { publicUrl } from "@/utilities/publicUrl";

// Floor-plan masks: R = primary line coverage, G = secondary line coverage (equipment drawings).
// The theme's floor colors are painted in by the shader below (brand/BRAND.md §8a).
const floorTexturePaths: any = {
  DC01: publicUrl("floors/DC01.png"),
  DC02: publicUrl("floors/DC02.png"),
  DC03: publicUrl("floors/DC03.png"),
  DC04: publicUrl("floors/DC04.png"),
  DC05: publicUrl("floors/DC05.png"),
  DC06: publicUrl("floors/DC06.png"),
  DC07: publicUrl("floors/DC07.png"),
};

export const FLOOR_NAME = "floor";

// Colors are mixed and written in sRGB (no color-space conversion), so the floor shows the exact
// token hex values, unlit
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D mask;
  uniform vec3 baseColor;
  uniform vec3 primaryColor;
  uniform vec3 secondaryColor;
  varying vec2 vUv;
  void main() {
    vec3 m = texture2D(mask, vUv).rgb;
    vec3 color = mix(baseColor, primaryColor, m.r);
    color = mix(color, secondaryColor, m.g);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function srgb(hex: number): Vector3 {
  const { r, g, b } = new Color().setHex(hex).getRGB(new Color(), SRGBColorSpace);
  return new Vector3(r, g, b);
}

export function setFloorColors(
  floor: Mesh,
  colors: SceneTheme["floor"]
): void {
  const uniforms = (floor.material as ShaderMaterial).uniforms;
  uniforms.baseColor.value = srgb(colors.base);
  uniforms.primaryColor.value = srgb(colors.primary);
  uniforms.secondaryColor.value = srgb(colors.secondary);
}

export default function useFloor(
  width: number,
  depth: number,
  name: string,
  colors: SceneTheme["floor"]
) {
  // * DISPLAY LAYER * //
  // The mask is data, not color - it stays in linear (no color space) on purpose
  const floorMask = new TextureLoader().load(floorTexturePaths[name]);
  const geometryFloor = new PlaneGeometry(width, depth, 1, 1);
  const materialFloor = new ShaderMaterial({
    uniforms: {
      mask: { value: floorMask },
      baseColor: { value: new Vector3() },
      primaryColor: { value: new Vector3() },
      secondaryColor: { value: new Vector3() },
    },
    vertexShader,
    fragmentShader,
    side: DoubleSide,
    toneMapped: false,
  });
  const floor = new Mesh(geometryFloor, materialFloor);
  floor.name = FLOOR_NAME;
  setFloorColors(floor, colors);
  floor.castShadow = false;
  floor.receiveShadow = false;
  floor.rotation.x = MathUtils.degToRad(-90);
  floor.layers.set(0);

  return floor;
}
