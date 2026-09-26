// fedddev brand colors as Three.js hex numbers - mirrors brand/tokens.css and the 3D roles in
// brand/BRAND.md §8a (digital twins: the environment recedes, the equipment is the fruit)
import type { Theme } from "@/composables/useTheme";

export const JUNGLE = 0x0f2a24;
export const JUNGLE_SURFACE = 0x173d34;
export const FRANGIPANI = 0xf6ebd9;
export const FERN = 0xa9d8a0;
export const MANGO = 0xf4b942; // dark mode only
export const PAPAYA = 0xf2784b;
export const LAGOON = 0x2ba39b;
export const HIBISCUS = 0xe0457b;
export const MUTED_ON_LIGHT = 0x4a5a55;
export const WHITE = 0xffffff;

export interface SceneTheme {
  background: number;
  // Floor-plan colors are exact opaque hexes (secondary lines come pre-blended)
  floor: { base: number; primary: number; secondary: number };
  // Neutral equipment (cabinets) and dominant equipment (Pod containment)
  cabinet: number;
  pod: number;
}

export const SCENE_THEMES: Record<Theme, SceneTheme> = {
  dark: {
    background: JUNGLE,
    floor: { base: JUNGLE_SURFACE, primary: FERN, secondary: 0x598365 },
    cabinet: FRANGIPANI,
    pod: PAPAYA,
  },
  light: {
    background: FRANGIPANI,
    floor: { base: WHITE, primary: JUNGLE, secondary: 0x95d1cd },
    cabinet: JUNGLE_SURFACE,
    pod: PAPAYA,
  },
};

// RPP power-feed colors encode data, so they keep their encoding in both modes (§8a) - red, blue
// and grey feeds. (BRAND.md also suggests jungle edge lines on them; left out by the owner's choice.)
export const RPP_COLORS = {
  red: HIBISCUS,
  blue: LAGOON,
  // The grey feed shown in mango: a true grey got lost among the neutral cabinets
  grey: MANGO,
} as const;
