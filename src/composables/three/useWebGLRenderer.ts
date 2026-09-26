import { WebGLRenderer } from "three";

export default function useWebGLRenderer(width: number, height: number) {
  // * RENDERER w/ default CANVAS * //
  const renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // No tone mapping, so lit faces can reach the exact brand colors

  return renderer;
}
