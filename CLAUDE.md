## Brand
This project is built by fedddev. Follow `brand/BRAND.md` for all styling, color, typography,
logo/wordmark usage, dark/light mode and 3D scene decisions, and use the variables in
`brand/tokens.css` (semantic tokens like `--fd-bg`, `--fd-accent-cool`) instead of hard-coded
values. Artwork is in `public/brand/` (served at `/brand/...`) — use the `-dark` or `-light` file
that matches the active theme (`-fern` on fern blocks); never redraw, retype or recolor it.

- Theme: `src/composables/useTheme.ts` is the single source of truth. It follows the OS until the
  user picks one with the navbar toggle, and sets `data-theme` on `<html>` so `tokens.css` switches.
- Tailwind exposes the semantic tokens as `fd-*` colors (`bg-fd-bg`, `text-fd-text`,
  `bg-fd-surface`, `decoration-fd-link-underline`, …) plus `font-display` / `font-mono` /
  `font-brand`; `sans` is the brand body font. In light mode accents are never text.
- Three.js colors follow BRAND.md §8a and live in `src/utilities/brandColors.ts`: `SCENE_THEMES`
  per mode (background, floor base/primary/secondary lines, neutral + dominant equipment) and `RPP_COLORS` for data-encoding colors, which stay the same in both modes. Scene code
  reads them through the theme and updates when it changes.
- No edge lines on equipment (BRAND.md §8a) - separate objects with lighting or small gaps instead.
- Fern brand blocks (BRAND.md §2a, `.fd-fern` in `tokens.css`, `-fern` artwork) are for brand
  moments only (splash/about) - never behind the working UI or as the 3D floor.
- Navbar lockup: the official `fedddev-wordmark-{dark,light}.svg` followed by the product name
  **DCIM** as a Michroma label (BRAND.md allows Michroma for short all-caps labels).
