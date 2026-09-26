// CSS url() for an imported asset. Always quoted: small assets are inlined by Vite as data: URLs,
// which contain quotes and spaces that make an unquoted url() invalid.
export function cssUrl(path: string): string {
  return `url(${JSON.stringify(path)})`;
}
