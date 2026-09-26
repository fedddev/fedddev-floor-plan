import { Scene, Color } from "three";
import useLights from "./useLights";

export default function useWebGLScene(background: number) {
  const scene = new Scene();
  scene.background = new Color(background);

  // No environment map: reflections of a photo tint the brand colors (see brand/BRAND.md §8)

  // * LIGHTS * //
  const { directionalLight, hemisphereLight } = useLights();
  scene.add(directionalLight);
  scene.add(hemisphereLight);

  return scene;
}
