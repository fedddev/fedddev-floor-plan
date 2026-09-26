// URL for a file in public/ that is loaded at runtime (not imported). Prefixed with Vite's base so
// it also resolves when the app is served from a subpath, like GitHub Pages' /fedddev-floor-plan/.
export function publicUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}
