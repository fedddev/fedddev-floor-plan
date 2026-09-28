// Generates the demo facilities DC01-DC07: an original floor-plan mask per facility
// (public/floors/{NAME}.png) and the layout files the app loads (src/data/{NAME}/*.json).
// Everything here is synthetic - building layouts, halls, pods and cabinets are made up from
// the configs below with a seeded random generator, so every run produces the same output.
//
//   node scripts/generate-facilities.mjs              # all facilities
//   node scripts/generate-facilities.mjs DC03 DC05    # just these
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FQLN_ROOT = "FD";

// * RANDOM (seeded per facility) * //
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rand = mulberry32(1);
const between = (a, b) => a + rand() * (b - a);
const pick = (list) => list[Math.floor(rand() * list.length)];

// * CABINET TYPES * //
// Generic, vendor-neutral catalog. RPP ids 10-12 are the power-feed colors in AllCabinets.vue.
const CABINET_TYPES = [
  { id: 1, name: "Standard 42U", description: "600 x 1200 mm", metricDimensions: { width: 0.6, height: 1.991, depth: 1.2 } },
  { id: 2, name: "Standard 48U", description: "600 x 1200 mm", metricDimensions: { width: 0.6, height: 2.258, depth: 1.2 } },
  { id: 3, name: "Tall 52U", description: "600 x 1200 mm", metricDimensions: { width: 0.6, height: 2.436, depth: 1.2 } },
  { id: 4, name: "Wide 42U", description: "750 x 1200 mm", metricDimensions: { width: 0.75, height: 1.991, depth: 1.2 } },
  { id: 5, name: "Wide 48U", description: "750 x 1200 mm", metricDimensions: { width: 0.75, height: 2.258, depth: 1.2 } },
  { id: 6, name: "Network 45U", description: "800 x 1200 mm", metricDimensions: { width: 0.8, height: 2.125, depth: 1.2 } },
  { id: 7, name: "Storage 42U", description: "600 x 1100 mm", metricDimensions: { width: 0.6, height: 1.991, depth: 1.1 } },
  { id: 10, name: "RPP - A Feed", description: "Remote power panel, A feed", metricDimensions: { width: 0.6, height: 1.991, depth: 1.2 } },
  { id: 11, name: "RPP - B Feed", description: "Remote power panel, B feed", metricDimensions: { width: 0.6, height: 1.991, depth: 1.2 } },
  { id: 12, name: "RPP - C Feed", description: "Remote power panel, C feed", metricDimensions: { width: 0.6, height: 1.991, depth: 1.2 } },
];
const TYPE = Object.fromEntries(CABINET_TYPES.map((t) => [t.id, t]));
// Cabinet mixes a hall can be fitted out with: [type id, weight]
const HALL_PROFILES = [
  [[1, 8], [4, 1], [7, 1]],
  [[2, 7], [5, 2], [6, 1]],
  [[3, 6], [2, 2], [6, 1]],
  [[1, 4], [2, 4], [4, 1], [7, 1]],
];

// * POD GEOMETRY (metres, from the pod and cabinet glTFs as the app places them) * //
const ROW_LENGTH = 7.75; // 12 x 600 mm cabinets + 50 mm gaps - the pod model's length
const ROW02_OFFSET = 1.7526; // ROW02 sits this far +x of ROW01 / the pod origin
const CAB_GAP = 0.05;
const POD_EXTENT = { left: 3.1, right: 4.1, top: 0.5, bottom: 7.9 }; // pod model around its origin
const POD_PITCH = { x: 7.4, z: 11.0 };
const CABINET_AREA = { x0: -1.8, x1: ROW02_OFFSET + 1.8, z0: 0, z1: ROW_LENGTH }; // both rows + aisle

// * FACILITIES * //
// Buildings are cut into horizontal bands (top to bottom) and, when there is a core (offices,
// lobby, dock), into segments beside it. "halls" bands share whatever depth the others leave.
const FACILITIES = [
  {
    name: "DC01", width: 200, depth: 120,
    buildings: [
      { x: 36, z: 24, w: 136, d: 72, core: { at: "left", w: 26, lobby: "left", dock: "top" },
        bands: ["mech:5", "halls", "corr:4", "elec:12"], hallsPerSegment: 2 },
    ],
    yards: [
      { type: "cooling", x: 64, z: 5, w: 108, d: 15 },
      { type: "generators", x: 64, z: 100, w: 108, d: 16 },
      { type: "substation", x: 176, z: 40, w: 20, d: 44 },
      { type: "parking", x: 3, z: 22, w: 24, d: 52, dir: "v" },
      { type: "tanks", x: 3, z: 80, w: 24, d: 34 },
      { type: "road", x0: 30, z0: 0, x1: 30, z1: 120, w: 5 },
    ],
  },
  {
    name: "DC02", width: 320, depth: 140,
    buildings: [
      { x: 14, z: 22, w: 262, d: 98, core: { at: "right", w: 30, lobby: "bottom", dock: "right" },
        bands: ["elec:12", "halls", "corr:5", "halls", "elec:12"], hallsPerSegment: 3 },
    ],
    yards: [
      { type: "generators", x: 14, z: 3, w: 228, d: 16 },
      { type: "generators", x: 14, z: 123, w: 228, d: 15 },
      { type: "cooling", x: 284, z: 6, w: 32, d: 86, dir: "v" },
      { type: "substation", x: 284, z: 98, w: 32, d: 22 },
      { type: "parking", x: 246, z: 124, w: 70, d: 14 },
    ],
  },
  {
    name: "DC03", width: 260, depth: 150,
    buildings: [
      { x: 18, z: 34, w: 224, d: 86, core: { at: "middle", w: 24, lobby: "top", dock: "bottom" },
        bands: ["corr:4", "halls", "elec:14"], hallsPerSegment: 2, elecBetween: 8 },
    ],
    yards: [
      { type: "cooling", x: 18, z: 4, w: 94, d: 26 },
      { type: "cooling", x: 148, z: 4, w: 94, d: 26 },
      { type: "parking", x: 116, z: 3, w: 28, d: 22, dir: "v" },
      { type: "generators", x: 18, z: 126, w: 94, d: 20 },
      { type: "generators", x: 148, z: 126, w: 94, d: 20 },
      { type: "tanks", x: 116, z: 128, w: 28, d: 19 },
    ],
  },
  {
    name: "DC04", width: 340, depth: 136,
    buildings: [
      { x: 10, z: 26, w: 300, d: 84, core: { at: "left", w: 28, lobby: "bottom", dock: "left" },
        bands: ["mech:5", "halls", "corr:4", "elec:12"], hallsPerSegment: 5 },
    ],
    yards: [
      { type: "parking", x: 3, z: 3, w: 34, d: 19 },
      { type: "cooling", x: 42, z: 4, w: 268, d: 18 },
      { type: "generators", x: 42, z: 114, w: 268, d: 18 },
      { type: "substation", x: 314, z: 28, w: 23, d: 46 },
      { type: "tanks", x: 314, z: 80, w: 23, d: 30 },
    ],
  },
  {
    name: "DC05", width: 240, depth: 170,
    buildings: [
      { x: 34, z: 28, w: 172, d: 114, core: { at: "middle", w: 26, lobby: "top", dock: "bottom" },
        bands: ["elec:11", "halls", "corr:5", "halls", "elec:11"], hallsPerSegment: 1 },
    ],
    yards: [
      { type: "generators", x: 4, z: 28, w: 25, d: 114, dir: "v" },
      { type: "cooling", x: 211, z: 28, w: 25, d: 114, dir: "v" },
      { type: "parking", x: 34, z: 4, w: 172, d: 18 },
      { type: "substation", x: 34, z: 148, w: 60, d: 19 },
      { type: "tanks", x: 146, z: 148, w: 60, d: 19 },
    ],
  },
  {
    name: "DC06", width: 280, depth: 130,
    buildings: [
      { x: 12, z: 26, w: 234, d: 78, core: { at: "right", w: 30, lobby: "bottom", dock: "top" },
        bands: ["halls", "corr:5", "elec:12"], hallsPerSegment: 3, elecBetween: 10 },
    ],
    yards: [
      { type: "cooling", x: 12, z: 5, w: 196, d: 17 },
      { type: "generators", x: 252, z: 8, w: 25, d: 114, dir: "v" },
      { type: "substation", x: 12, z: 110, w: 64, d: 17 },
      { type: "tanks", x: 82, z: 110, w: 56, d: 17 },
      { type: "parking", x: 146, z: 111, w: 100, d: 16 },
    ],
  },
  {
    name: "DC07", width: 600, depth: 150,
    buildings: [
      { x: 12, z: 28, w: 272, d: 90, core: { at: "left", w: 24, lobby: "bottom", dock: "top" },
        bands: ["mech:5", "halls", "corr:4", "elec:12"], hallsPerSegment: 4 },
      { x: 316, z: 28, w: 272, d: 90, core: { at: "right", w: 24, lobby: "bottom", dock: "top" },
        bands: ["mech:5", "halls", "corr:4", "elec:12"], hallsPerSegment: 4 },
    ],
    yards: [
      { type: "parking", x: 3, z: 4, w: 30, d: 20 },
      { type: "cooling", x: 40, z: 4, w: 244, d: 20 },
      { type: "cooling", x: 316, z: 4, w: 244, d: 20 },
      { type: "parking", x: 567, z: 4, w: 30, d: 20 },
      { type: "substation", x: 3, z: 122, w: 30, d: 24 },
      { type: "generators", x: 40, z: 122, w: 244, d: 24 },
      { type: "generators", x: 316, z: 122, w: 244, d: 24 },
      { type: "tanks", x: 567, z: 122, w: 30, d: 24 },
      { type: "road", x0: 300, z0: 0, x1: 300, z1: 150, w: 10 },
    ],
  },
];

// * MASK RASTERIZER * //
// The floor texture is a mask, not a picture: R = primary lines (walls), G = secondary lines
// (equipment and site). useFloor.ts paints the theme's colors in. Shapes are in metres
// (x right, z down from the top-left corner) and anti-aliased by pixel coverage.
const PRIMARY = 0;
const SECONDARY = 1;
const MASK_WIDTH = 8192;
const MIN_PX = 1.6; // thinnest line, so it survives the texture's mipmaps

class Mask {
  constructor(widthM, depthM) {
    this.s = MASK_WIDTH / widthM;
    this.w = MASK_WIDTH;
    this.h = Math.round(depthM * this.s);
    this.px = Buffer.alloc(this.w * this.h * 3);
  }
  plot(x, y, ch, coverage) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || coverage <= 0) return;
    const i = (y * this.w + x) * 3 + ch;
    const v = Math.round(Math.min(coverage, 1) * 255);
    if (v > this.px[i]) this.px[i] = v;
  }
  box(x0, z0, x1, z1, ch) {
    const s = this.s;
    let [a, b] = [Math.min(x0, x1) * s, Math.max(x0, x1) * s];
    let [c, d] = [Math.min(z0, z1) * s, Math.max(z0, z1) * s];
    if (b - a < MIN_PX) [a, b] = [(a + b) / 2 - MIN_PX / 2, (a + b) / 2 + MIN_PX / 2];
    if (d - c < MIN_PX) [c, d] = [(c + d) / 2 - MIN_PX / 2, (c + d) / 2 + MIN_PX / 2];
    for (let y = Math.max(0, Math.floor(c)); y < Math.min(this.h, Math.ceil(d)); y++) {
      const cy = Math.min(d, y + 1) - Math.max(c, y);
      for (let x = Math.max(0, Math.floor(a)); x < Math.min(this.w, Math.ceil(b)); x++) {
        this.plot(x, y, ch, cy * (Math.min(b, x + 1) - Math.max(a, x)));
      }
    }
  }
  erase(x0, z0, x1, z1, ch) {
    const s = this.s;
    for (let y = Math.max(0, Math.floor(z0 * s)); y < Math.min(this.h, Math.ceil(z1 * s)); y++) {
      for (let x = Math.max(0, Math.floor(x0 * s)); x < Math.min(this.w, Math.ceil(x1 * s)); x++) {
        this.px[(y * this.w + x) * 3 + ch] = 0;
      }
    }
  }
  // Pixels within reach of a shape, tested by distance (px) from their centre
  byDistance(x0, z0, x1, z1, ch, distance) {
    const s = this.s;
    for (let y = Math.max(0, Math.floor(z0 * s) - 2); y < Math.min(this.h, Math.ceil(z1 * s) + 2); y++) {
      for (let x = Math.max(0, Math.floor(x0 * s) - 2); x < Math.min(this.w, Math.ceil(x1 * s) + 2); x++) {
        this.plot(x, y, ch, distance(x + 0.5, y + 0.5));
      }
    }
  }
  line(x0, z0, x1, z1, t, ch) {
    if (x0 === x1 || z0 === z1) {
      this.box(x0 - (x0 === x1 ? t / 2 : 0), z0 - (z0 === z1 ? t / 2 : 0),
        x1 + (x0 === x1 ? t / 2 : 0), z1 + (z0 === z1 ? t / 2 : 0), ch);
      return;
    }
    const s = this.s;
    const hw = Math.max(t * s, MIN_PX) / 2;
    const [ax, az, bx, bz] = [x0 * s, z0 * s, x1 * s, z1 * s];
    const len2 = (bx - ax) ** 2 + (bz - az) ** 2;
    this.byDistance(Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), ch, (px, pz) => {
      const k = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / len2));
      const dist = Math.hypot(px - ax - k * (bx - ax), pz - az - k * (bz - az));
      return hw + 0.5 - dist;
    });
  }
  rect(x0, z0, x1, z1, t, ch) {
    this.line(x0 - t / 2, z0, x1 + t / 2, z0, t, ch);
    this.line(x0 - t / 2, z1, x1 + t / 2, z1, t, ch);
    this.line(x0, z0, x0, z1, t, ch);
    this.line(x1, z0, x1, z1, t, ch);
  }
  dashed(x0, z0, x1, z1, t, ch, dash = 1.2, gap = 0.9) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    for (let p = 0; p < len; p += dash + gap) {
      const q = Math.min(len, p + dash);
      this.line(x0 + ((x1 - x0) * p) / len, z0 + ((z1 - z0) * p) / len,
        x0 + ((x1 - x0) * q) / len, z0 + ((z1 - z0) * q) / len, t, ch);
    }
  }
  dashedRect(x0, z0, x1, z1, t, ch, dash, gap) {
    this.dashed(x0, z0, x1, z0, t, ch, dash, gap);
    this.dashed(x0, z1, x1, z1, t, ch, dash, gap);
    this.dashed(x0, z0, x0, z1, t, ch, dash, gap);
    this.dashed(x1, z0, x1, z1, t, ch, dash, gap);
  }
  // Circle outline, or the arc between angles a0..a1 (radians, clockwise on the page from +x)
  arc(cx, cz, r, t, ch, a0 = 0, a1 = Math.PI * 2) {
    const s = this.s;
    const hw = Math.max(t * s, MIN_PX) / 2;
    this.byDistance(cx - r, cz - r, cx + r, cz + r, ch, (px, pz) => {
      const dx = px - cx * s;
      const dz = pz - cz * s;
      let angle = Math.atan2(dz, dx);
      if (angle < a0) angle += Math.PI * 2;
      if (angle < a0 || angle > a1) return 0;
      return hw + 0.5 - Math.abs(Math.hypot(dx, dz) - r * s);
    });
  }
  disc(cx, cz, r, ch) {
    const s = this.s;
    this.byDistance(cx - r, cz - r, cx + r, cz + r, ch,
      (px, pz) => r * s + 0.5 - Math.hypot(px - cx * s, pz - cz * s));
  }
}

// * DRAWING PARTS * //
const WALL = { exterior: 0.5, hall: 0.32, room: 0.2 };
const EQUIP = 0.1;

// A door in a wall: cut the opening (primary) and draw the leaf swing (secondary).
// "toward" is the side the door swings into: "+" = +z (horizontal wall) or +x (vertical wall).
function door(mask, orient, at, center, width, toward, double = false) {
  const half = width / 2;
  const cut = 0.45;
  if (orient === "h") mask.erase(center - half, at - cut, center + half, at + cut, PRIMARY);
  else mask.erase(at - cut, center - half, at + cut, center + half, PRIMARY);
  const leaf = double ? half : width;
  const sign = toward === "+" ? 1 : -1;
  const hinges = double ? [[-1, 1], [1, -1]] : [[-1, 1]]; // [hinge end, closes toward]
  for (const [end, closes] of hinges) {
    let hx, hz, closedAngle, openAngle;
    if (orient === "h") {
      [hx, hz] = [center + end * half, at];
      closedAngle = closes > 0 ? 0 : Math.PI;
      openAngle = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      [hx, hz] = [at, center + end * half];
      closedAngle = closes > 0 ? Math.PI / 2 : -Math.PI / 2;
      openAngle = sign > 0 ? 0 : Math.PI;
    }
    let [a0, a1] = [Math.min(closedAngle, openAngle), Math.max(closedAngle, openAngle)];
    if (a1 - a0 > Math.PI) [a0, a1] = [a1, a0 + Math.PI * 2];
    mask.arc(hx, hz, leaf, 0.05, SECONDARY, a0, a1);
    mask.line(hx, hz, hx + Math.cos(openAngle) * leaf, hz + Math.sin(openAngle) * leaf, 0.06, SECONDARY);
  }
}

// Row of fan-wall cooling units along one long wall inside a hall
function fanWall(mask, x0, x1, z, depth, facing) {
  const unit = 2.4;
  const count = Math.floor((x1 - x0 + 0.6) / (unit + 0.6));
  const start = x0 + (x1 - x0 - (count * unit + (count - 1) * 0.6)) / 2;
  for (let i = 0; i < count; i++) {
    const ux = start + i * (unit + 0.6);
    const [za, zb] = facing > 0 ? [z, z + depth] : [z - depth, z];
    mask.rect(ux, za, ux + unit, zb, EQUIP, SECONDARY);
    mask.arc(ux + unit / 2, (za + zb) / 2, depth * 0.36, 0.05, SECONDARY);
  }
}

function electricalRoom(mask, r) {
  const kind = pick(["ups", "battery", "switchgear"]);
  const [w, d] = [r.x1 - r.x0, r.z1 - r.z0];
  const horizontal = w >= d;
  const pad = 1.4;
  if (kind === "battery") {
    const n = Math.max(1, Math.floor(((horizontal ? d : w) - pad * 2) / 1.3));
    for (let i = 0; i < n; i++) {
      const o = pad + i * 1.3;
      if (horizontal) mask.rect(r.x0 + pad, r.z0 + o, r.x1 - pad, r.z0 + o + 0.45, 0.06, SECONDARY);
      else mask.rect(r.x0 + o, r.z0 + pad, r.x0 + o + 0.45, r.z1 - pad, 0.06, SECONDARY);
    }
    return;
  }
  const lineups = kind === "ups" ? 2 : 1;
  for (let l = 0; l < lineups; l++) {
    const depth = 0.9;
    const off = pad + l * ((horizontal ? d : w) - pad * 2 - depth);
    const module = kind === "ups" ? 0.8 : 1.0;
    if (horizontal) {
      const [a, b, z] = [r.x0 + pad, r.x1 - pad, r.z0 + off];
      mask.rect(a, z, b, z + depth, EQUIP, SECONDARY);
      for (let x = a + module; x < b - 0.2; x += module) mask.line(x, z, x, z + depth, 0.05, SECONDARY);
      if (kind === "switchgear") mask.dashed(a, z + depth + 1.2, b, z + depth + 1.2, 0.05, SECONDARY, 0.5, 0.4);
    } else {
      const [a, b, x] = [r.z0 + pad, r.z1 - pad, r.x0 + off];
      mask.rect(x, a, x + depth, b, EQUIP, SECONDARY);
      for (let z = a + module; z < b - 0.2; z += module) mask.line(x, z, x + depth, z, 0.05, SECONDARY);
      if (kind === "switchgear") mask.dashed(x + depth + 1.2, a, x + depth + 1.2, b, 0.05, SECONDARY, 0.5, 0.4);
    }
  }
}

function stairs(mask, x0, z0, x1, z1) {
  mask.rect(x0, z0, x1, z1, 0.08, SECONDARY);
  const mid = (z0 + z1) / 2;
  mask.line(x0 + 0.8, mid, x1, mid, 0.08, SECONDARY);
  for (let x = x0 + 0.8; x < x1; x += 0.3) mask.line(x, z0, x, z1, 0.04, SECONDARY);
}

// Split the core into rooms (binary space partition) and draw their walls
function coreRooms(mask, core) {
  const rooms = [];
  const split = (r, depth) => {
    const [w, d] = [r.x1 - r.x0, r.z1 - r.z0];
    if ((w < 12 && d < 12) || depth > 5) return rooms.push(r);
    if (w > d) {
      const x = r.x0 + w * between(0.35, 0.65);
      mask.line(x, r.z0, x, r.z1, WALL.room, PRIMARY);
      split({ ...r, x1: x }, depth + 1);
      split({ ...r, x0: x }, depth + 1);
    } else {
      const z = r.z0 + d * between(0.35, 0.65);
      mask.line(r.x0, z, r.x1, z, WALL.room, PRIMARY);
      split({ ...r, z1: z }, depth + 1);
      split({ ...r, z0: z }, depth + 1);
    }
  };
  split(core, 0);
  // A door into every room, on a wall it shares with another room
  for (const r of rooms) {
    const sides = [];
    if (r.x0 > core.x0 + 0.1 && r.z1 - r.z0 > 2.5) sides.push(["v", r.x0, "+"]);
    if (r.x1 < core.x1 - 0.1 && r.z1 - r.z0 > 2.5) sides.push(["v", r.x1, "-"]);
    if (r.z0 > core.z0 + 0.1 && r.x1 - r.x0 > 2.5) sides.push(["h", r.z0, "+"]);
    if (r.z1 < core.z1 - 0.1 && r.x1 - r.x0 > 2.5) sides.push(["h", r.z1, "-"]);
    if (!sides.length) continue;
    const [orient, at, toward] = pick(sides);
    const [a, b] = orient === "h" ? [r.x0, r.x1] : [r.z0, r.z1];
    door(mask, orient, at, between(a + 1.2, b - 1.2), 1.0, toward);
  }
  const big = rooms.filter((r) => r.x1 - r.x0 > 7 && r.z1 - r.z0 > 4.5);
  for (const r of big.slice(0, 2)) stairs(mask, r.x0 + 0.8, r.z0 + 0.8, r.x0 + 6.8, r.z0 + 3.8);
  return rooms;
}

// * YARDS AND SITE * //
function generatorYard(mask, y) {
  mask.dashedRect(y.x, y.z, y.x + y.w, y.z + y.d, 0.1, SECONDARY, 1.5, 0.8);
  const vertical = y.dir === "v";
  const [along, across] = vertical ? [y.d, y.w] : [y.w, y.d];
  const genW = 3.6;
  const genL = Math.min(12, across - 3);
  const gap = 2.4;
  const count = Math.floor((along - 2 + gap) / (genW + gap));
  const start = (along - (count * genW + (count - 1) * gap)) / 2;
  for (let i = 0; i < count; i++) {
    const a = start + i * (genW + gap);
    const b = (across - genL) / 2;
    const [x0, z0, x1, z1] = vertical
      ? [y.x + b, y.z + a, y.x + b + genL, y.z + a + genW]
      : [y.x + a, y.z + b, y.x + a + genW, y.z + b + genL];
    mask.rect(x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5, 0.05, SECONDARY); // pad
    mask.rect(x0, z0, x1, z1, EQUIP, SECONDARY);
    // radiator grille at one end, engine block, exhaust stack
    for (let k = 1; k <= 5; k++) {
      if (vertical) mask.line(x1 - k * 0.3, z0 + 0.3, x1 - k * 0.3, z1 - 0.3, 0.04, SECONDARY);
      else mask.line(x0 + 0.3, z1 - k * 0.3, x1 - 0.3, z1 - k * 0.3, 0.04, SECONDARY);
    }
    if (vertical) {
      mask.rect(x0 + 1.2, z0 + 0.7, x0 + genL * 0.55, z1 - 0.7, 0.05, SECONDARY);
      mask.arc(x0 + genL * 0.7, (z0 + z1) / 2, 0.45, 0.06, SECONDARY);
    } else {
      mask.rect(x0 + 0.7, z0 + 1.2, x1 - 0.7, z0 + genL * 0.55, 0.05, SECONDARY);
      mask.arc((x0 + x1) / 2, z0 + genL * 0.7, 0.45, 0.06, SECONDARY);
    }
  }
}

function coolingYard(mask, y) {
  const vertical = y.dir === "v";
  const [along, across] = vertical ? [y.d, y.w] : [y.w, y.d];
  const unitL = 11;
  const unitW = 2.3;
  const lanes = Math.max(1, Math.floor((across - 1.5) / (unitW + 1.8)));
  const laneStart = (across - (lanes * unitW + (lanes - 1) * 1.8)) / 2;
  const count = Math.floor((along - 1 + 1.5) / (unitL + 1.5));
  const start = (along - (count * unitL + (count - 1) * 1.5)) / 2;
  for (let lane = 0; lane < lanes; lane++) {
    for (let i = 0; i < count; i++) {
      const a = start + i * (unitL + 1.5);
      const b = laneStart + lane * (unitW + 1.8);
      const [x0, z0, x1, z1] = vertical
        ? [y.x + b, y.z + a, y.x + b + unitW, y.z + a + unitL]
        : [y.x + a, y.z + b, y.x + a + unitL, y.z + b + unitW];
      mask.rect(x0, z0, x1, z1, EQUIP, SECONDARY);
      for (let f = 0; f < 4; f++) {
        const c = 1.4 + f * ((unitL - 2.8) / 3);
        const [cx, cz] = vertical ? [(x0 + x1) / 2, z0 + c] : [x0 + c, (z0 + z1) / 2];
        mask.arc(cx, cz, 0.9, 0.05, SECONDARY);
        mask.disc(cx, cz, 0.16, SECONDARY);
      }
    }
  }
}

function substation(mask, y) {
  mask.dashedRect(y.x, y.z, y.x + y.w, y.z + y.d, 0.1, SECONDARY, 0.6, 0.4);
  const size = 4.2;
  const cols = Math.max(1, Math.floor((y.w - 2) / (size + 2.5)));
  const rows = Math.max(1, Math.floor((y.d - 7) / (size + 2.5)));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = y.x + 2 + c * (size + 2.5);
      const z = y.z + 2 + r * (size + 2.5);
      mask.rect(x, z, x + size, z + size, EQUIP, SECONDARY);
      mask.arc(x + size / 2, z + size / 2, size * 0.3, 0.06, SECONDARY);
      for (let k = 1; k < 4; k++) mask.line(x + (k * size) / 4, z, x + (k * size) / 4, z - 0.5, 0.05, SECONDARY);
    }
  }
  mask.rect(y.x + 2, y.z + y.d - 4.5, y.x + Math.min(y.w - 2, 14), y.z + y.d - 1.5, EQUIP, SECONDARY);
}

function tanks(mask, y) {
  const r = Math.min(y.w, y.d) / 2 - 2;
  const count = Math.max(1, Math.floor(Math.max(y.w, y.d) / (r * 2 + 3)));
  for (let i = 0; i < count; i++) {
    const along = (Math.max(y.w, y.d) / count) * (i + 0.5);
    const [cx, cz] = y.w >= y.d ? [y.x + along, y.z + y.d / 2] : [y.x + y.w / 2, y.z + along];
    mask.arc(cx, cz, r, EQUIP, SECONDARY);
    mask.arc(cx, cz, r - 0.8, 0.05, SECONDARY);
  }
}

function parking(mask, y) {
  const vertical = y.dir === "v";
  const [along, across] = vertical ? [y.d, y.w] : [y.w, y.d];
  const stall = 5.2;
  const aisle = across - stall * 2;
  const bays = aisle >= 6 ? [0, stall + aisle] : [0];
  for (let p = 1.5; p <= along - 1.5; p += 2.6) {
    for (const b of bays) {
      if (vertical) mask.line(y.x + b, y.z + p, y.x + b + stall, y.z + p, 0.08, SECONDARY);
      else mask.line(y.x + p, y.z + b, y.x + p, y.z + b + stall, 0.08, SECONDARY);
    }
  }
  if (vertical) mask.rect(y.x, y.z, y.x + y.w, y.z + y.d, 0.1, SECONDARY);
  else mask.rect(y.x, y.z, y.x + y.w, y.z + y.d, 0.1, SECONDARY);
}

function road(mask, y) {
  const vertical = y.x0 === y.x1;
  const h = y.w / 2;
  if (vertical) {
    mask.line(y.x0 - h, y.z0, y.x0 - h, y.z1, 0.15, SECONDARY);
    mask.line(y.x0 + h, y.z0, y.x0 + h, y.z1, 0.15, SECONDARY);
    if (y.w >= 7) mask.dashed(y.x0, y.z0, y.x0, y.z1, 0.12, SECONDARY, 3, 3);
  } else {
    mask.line(y.x0, y.z0 - h, y.x1, y.z0 - h, 0.15, SECONDARY);
    mask.line(y.x0, y.z0 + h, y.x1, y.z0 + h, 0.15, SECONDARY);
    if (y.w >= 7) mask.dashed(y.x0, y.z0, y.x1, y.z0, 0.12, SECONDARY, 3, 3);
  }
}

const YARDS = { generators: generatorYard, cooling: coolingYard, substation, tanks, parking, road };

// * BUILDING LAYOUT * //
function layoutBuilding(b) {
  const x1 = b.x + b.w;
  const z1 = b.z + b.d;
  const core = b.core;
  let segments = [[b.x, x1]];
  let coreRect = null;
  if (core?.at === "left") {
    coreRect = { x0: b.x, x1: b.x + core.w };
    segments = [[b.x + core.w, x1]];
  } else if (core?.at === "right") {
    coreRect = { x0: x1 - core.w, x1 };
    segments = [[b.x, x1 - core.w]];
  } else if (core?.at === "middle") {
    const cx = b.x + (b.w - core.w) / 2;
    coreRect = { x0: cx, x1: cx + core.w };
    segments = [[b.x, cx], [cx + core.w, x1]];
  }
  if (coreRect) Object.assign(coreRect, { z0: b.z, z1 });

  const bands = b.bands.map((spec) => {
    const [type, size] = spec.split(":");
    return { type, size: size ? Number(size) : null };
  });
  const fixed = bands.reduce((sum, band) => sum + (band.size ?? 0), 0);
  const hallBands = bands.filter((band) => band.size === null).length;
  let z = b.z;
  for (const band of bands) {
    band.size ??= (b.d - fixed) / hallBands;
    [band.z0, band.z1] = [z, z + band.size];
    z += band.size;
  }

  const halls = [];
  const elecRooms = [];
  const corridors = [];
  const galleries = [];
  for (const [sx0, sx1] of segments) {
    bands.forEach((band, i) => {
      const rect = { x0: sx0, x1: sx1, z0: band.z0, z1: band.z1 };
      const above = bands[i - 1]?.type;
      const below = bands[i + 1]?.type;
      if (band.type === "corr") corridors.push(rect);
      if (band.type === "mech") galleries.push(rect);
      if (band.type === "elec") {
        const n = Math.max(1, Math.round((sx1 - sx0) / 16));
        for (let k = 0; k < n; k++) {
          elecRooms.push({ ...rect, x0: sx0 + ((sx1 - sx0) * k) / n, x1: sx0 + ((sx1 - sx0) * (k + 1)) / n,
            doorSide: above === "corr" ? "top" : below === "corr" ? "bottom" : null });
        }
      }
      if (band.type === "halls") {
        const n = b.hallsPerSegment;
        const strip = b.elecBetween ?? 0;
        const hallW = (sx1 - sx0 - strip * (n - 1)) / n;
        for (let k = 0; k < n; k++) {
          const hx = sx0 + k * (hallW + strip);
          const doorSides = [above === "corr" && "top", below === "corr" && "bottom"].filter(Boolean);
          const coolingSide = above === "mech" ? "top" : below === "mech" ? "bottom"
            : doorSides.includes("top") ? "bottom" : "top";
          halls.push({ ...rect, x0: hx, x1: hx + hallW, doorSides, coolingSide });
          if (strip && k < n - 1) {
            // Electrical rooms between two halls, stacked, opening onto the corridor
            const rooms = Math.max(1, Math.round((band.z1 - band.z0) / 18));
            for (let r = 0; r < rooms; r++) {
              const rz0 = band.z0 + ((band.z1 - band.z0) * r) / rooms;
              const rz1 = band.z0 + ((band.z1 - band.z0) * (r + 1)) / rooms;
              elecRooms.push({ x0: hx + hallW, x1: hx + hallW + strip, z0: rz0, z1: rz1,
                doorSide: r === 0 && above === "corr" ? "top" : r === rooms - 1 && below === "corr" ? "bottom" : "hall" });
            }
          }
        }
      }
    });
  }
  return { rect: { x0: b.x, z0: b.z, x1, z1 }, core: coreRect, bands, segments, halls, elecRooms, corridors, galleries };
}

function drawBuilding(mask, b, layout) {
  const { rect, core } = layout;
  // Band and segment walls
  for (const [sx0, sx1] of layout.segments) {
    for (const band of layout.bands.slice(1)) mask.line(sx0, band.z0, sx1, band.z0, WALL.hall, PRIMARY);
  }
  if (core) {
    if (core.x0 > rect.x0) mask.line(core.x0, rect.z0, core.x0, rect.z1, WALL.hall, PRIMARY);
    if (core.x1 < rect.x1) mask.line(core.x1, rect.z0, core.x1, rect.z1, WALL.hall, PRIMARY);
  }
  for (const h of layout.halls) {
    mask.line(h.x0, h.z0, h.x0, h.z1, WALL.hall, PRIMARY);
    mask.line(h.x1, h.z0, h.x1, h.z1, WALL.hall, PRIMARY);
  }
  for (const r of layout.elecRooms) {
    mask.rect(r.x0, r.z0, r.x1, r.z1, WALL.room, PRIMARY);
  }
  mask.rect(rect.x0, rect.z0, rect.x1, rect.z1, WALL.exterior, PRIMARY);

  // Contents
  for (const r of layout.elecRooms) electricalRoom(mask, r);
  for (const g of layout.galleries) {
    // Air handlers feeding the halls
    for (let x = g.x0 + 2; x + 4 < g.x1 - 1; x += 6) {
      mask.rect(x, g.z0 + 0.7, x + 4, g.z1 - 0.7, EQUIP, SECONDARY);
      mask.arc(x + 1.3, (g.z0 + g.z1) / 2, Math.min(0.9, (g.z1 - g.z0) / 2 - 1), 0.05, SECONDARY);
      for (let k = 1; k <= 4; k++) mask.line(x + 2.4 + k * 0.3, g.z0 + 0.9, x + 2.4 + k * 0.3, g.z1 - 0.9, 0.04, SECONDARY);
    }
  }
  if (core) coreRooms(mask, core);

  // Doors
  for (const h of layout.halls) {
    for (const side of h.doorSides) {
      const at = side === "top" ? h.z0 : h.z1;
      const toward = side === "top" ? "+" : "-";
      door(mask, "h", at, h.x0 + 4, 2.4, toward, true);
      door(mask, "h", at, h.x1 - 4, 2.4, toward, true);
    }
  }
  for (const r of layout.elecRooms) {
    const cx = (r.x0 + r.x1) / 2;
    if (r.doorSide === "top") door(mask, "h", r.z0, cx, 1.8, "+", true);
    else if (r.doorSide === "bottom") door(mask, "h", r.z1, cx, 1.8, "-", true);
    else door(mask, "v", r.x0, (r.z0 + r.z1) / 2, 1.2, "+");
  }
  for (const c of layout.corridors) {
    // Open into the core; exit doors at the building's outer walls
    const width = c.z1 - c.z0 - 0.8;
    for (const x of [c.x0, c.x1]) {
      const atCore = core && (Math.abs(x - core.x0) < 0.01 || Math.abs(x - core.x1) < 0.01);
      if (atCore) mask.erase(x - 0.4, c.z0 + 0.4, x + 0.4, c.z1 - 0.4, PRIMARY);
      else door(mask, "v", x, (c.z0 + c.z1) / 2, Math.min(1.2, width), x === rect.x0 ? "-" : "+");
    }
  }
  if (core) {
    const cx = (core.x0 + core.x1) / 2;
    const cz = (core.z0 + core.z1) / 2;
    const entries = {
      top: ["h", core.z0, cx, "-"],
      bottom: ["h", core.z1, cx, "+"],
      left: ["v", core.x0, cz, "-"],
      right: ["v", core.x1, cz, "+"],
    };
    const [orient, at, center, toward] = entries[b.core.lobby];
    door(mask, orient, at, center, 3.0, toward, true);
    // Loading dock: roll-up doors with bumpers outside
    const [dOrient, dAt, dCenter, dToward] = entries[b.core.dock];
    const out = dToward === "+" ? 1 : -1;
    for (const k of [-1, 0, 1]) {
      const c = dCenter + k * 5;
      if (dOrient === "h") {
        mask.erase(c - 1.8, dAt - 0.4, c + 1.8, dAt + 0.4, PRIMARY);
        mask.line(c - 1.8, dAt, c + 1.8, dAt, 0.05, SECONDARY);
        mask.rect(c - 2.1, dAt + out * 0.3, c - 1.8, dAt + out * 0.8, 0.05, SECONDARY);
        mask.rect(c + 1.8, dAt + out * 0.3, c + 2.1, dAt + out * 0.8, 0.05, SECONDARY);
      } else {
        mask.erase(dAt - 0.4, c - 1.8, dAt + 0.4, c + 1.8, PRIMARY);
        mask.line(dAt, c - 1.8, dAt, c + 1.8, 0.05, SECONDARY);
        mask.rect(dAt + out * 0.3, c - 2.1, dAt + out * 0.8, c - 1.8, 0.05, SECONDARY);
        mask.rect(dAt + out * 0.3, c + 1.8, dAt + out * 0.8, c + 2.1, 0.05, SECONDARY);
      }
    }
  }
}

// * PODS AND CABINETS * //
function hallPodGrid(h) {
  const clearance = 1.6;
  const cooling = 1.2 + 1.4; // fan wall depth + service clearance
  const inner = {
    x0: h.x0 + clearance,
    x1: h.x1 - clearance,
    z0: h.z0 + clearance + (h.coolingSide === "top" ? cooling : 0),
    z1: h.z1 - clearance - (h.coolingSide === "bottom" ? cooling : 0),
  };
  const spanX = POD_EXTENT.left + POD_EXTENT.right;
  const spanZ = POD_EXTENT.top + POD_EXTENT.bottom;
  const cols = Math.max(0, Math.floor((inner.x1 - inner.x0 - spanX) / POD_PITCH.x) + 1);
  const rows = Math.max(0, Math.floor((inner.z1 - inner.z0 - spanZ) / POD_PITCH.z) + 1);
  const offX = (inner.x1 - inner.x0 - ((cols - 1) * POD_PITCH.x + spanX)) / 2;
  const offZ = (inner.z1 - inner.z0 - ((rows - 1) * POD_PITCH.z + spanZ)) / 2;
  const spots = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      spots.push({
        col: c, row: r,
        x: inner.x0 + offX + POD_EXTENT.left + c * POD_PITCH.x,
        z: inner.z0 + offZ + POD_EXTENT.top + r * POD_PITCH.z,
      });
    }
  }
  return { inner, cols, rows, spots };
}

function weightedType(profile) {
  const total = profile.reduce((s, [, w]) => s + w, 0);
  let roll = rand() * total;
  for (const [id, w] of profile) if ((roll -= w) <= 0) return id;
  return profile[0][0];
}

// Cabinets for one full row, RPP first; the row never runs longer than the pod
function rowCabinets(rpp, profile) {
  const types = [rpp];
  let length = TYPE[rpp].metricDimensions.width;
  while (types.length < 12) {
    const id = weightedType(profile);
    const next = length + CAB_GAP + TYPE[id].metricDimensions.width;
    if (next > ROW_LENGTH + 1e-6) {
      // Top up with 600 mm cabinets where a wide one won't fit
      if (length + CAB_GAP + 0.6 > ROW_LENGTH + 1e-6) break;
      types.push(profile[0][0]);
      length += CAB_GAP + 0.6;
      continue;
    }
    types.push(id);
    length = next;
  }
  return types;
}

function generateFacility(f, index, ids) {
  rand = mulberry32(0x5eed + index * 7919);
  const mask = new Mask(f.width, f.depth);
  const fqln = `${FQLN_ROOT}.${f.name}`;
  const facilitySpace = { id: index + 1, name: f.name, fqln, metricDimensions: { width: f.width, height: 30, depth: f.depth } };
  const sectorSpaces = [];
  const podSpaces = [];
  const rowSpaces = [];
  const cabinetSpaces = [];

  // Site fence and yards first; buildings draw over them
  mask.dashedRect(1.5, 1.5, f.width - 1.5, f.depth - 1.5, 0.12, SECONDARY, 2.5, 1.5);
  for (const y of f.yards) YARDS[y.type](mask, y);

  let hallNumber = 0;
  for (const b of f.buildings) {
    const layout = layoutBuilding(b);
    drawBuilding(mask, b, layout);
    for (const h of layout.halls) {
      hallNumber++;
      const name = `HALL${String(hallNumber).padStart(2, "0")}`;
      const hallFqln = `${fqln}.${name}`;
      sectorSpaces.push({
        id: ids.sector++, name, fqln: hallFqln,
        metricArea: (h.x1 - h.x0) * (h.z1 - h.z0),
        bounds: {
          LOWER_LEFT: [h.x0, 0, h.z1], LOWER_RIGHT: [h.x1, 0, h.z1],
          UPPER_LEFT: [h.x0, 0, h.z0], UPPER_RIGHT: [h.x1, 0, h.z0],
        },
      });

      // Fan wall along the cooling side, building columns in the cross aisles
      const coolZ = h.coolingSide === "top" ? h.z0 + 0.4 : h.z1 - 0.4;
      fanWall(mask, h.x0 + 1.5, h.x1 - 1.5, coolZ, 1.2, h.coolingSide === "top" ? 1 : -1);
      const grid = hallPodGrid(h);
      for (let r = 0; r <= grid.rows; r++) {
        const z = r === 0 ? grid.inner.z0 : r === grid.rows ? grid.inner.z1
          : grid.spots[r].z - POD_EXTENT.top - (POD_PITCH.z - POD_EXTENT.top - POD_EXTENT.bottom) / 2;
        for (let c = 0; c <= grid.cols; c += 2) {
          const x = grid.spots.length ? grid.spots[0].x - POD_EXTENT.left - 0.15 + c * POD_PITCH.x : 0;
          if (x > h.x0 + 1 && x < h.x1 - 1 && r > 0 && r < grid.rows) mask.box(x - 0.3, z - 0.3, x + 0.3, z + 0.3, SECONDARY);
        }
      }

      // Every hall is fully built out: a pod on every spot, every row full
      const profile = pick(HALL_PROFILES);
      grid.spots.forEach((spot, i) => {
        mask.rect(spot.x + CABINET_AREA.x0, spot.z + CABINET_AREA.z0,
          spot.x + CABINET_AREA.x1, spot.z + CABINET_AREA.z1, 0.06, SECONDARY);
        const podName = `${String.fromCharCode(65 + spot.row)}${String(spot.col + 1).padStart(2, "0")}`;
        const podFqln = `${hallFqln}.${podName}`;
        podSpaces.push({
          id: ids.pod++, name: podName, fqln: podFqln,
          translation: [spot.x, 0, spot.z],
          metricDimensions: { width: ROW02_OFFSET, height: 2.2, depth: ROW_LENGTH },
        });
        ["ROW01", "ROW02"].forEach((rowName, r) => {
          const rowFqln = `${podFqln}.${rowName}`;
          const rpp = r === 0 ? 10 : i % 2 ? 12 : 11;
          const types = rowCabinets(rpp, profile);
          const length = types.reduce((s, id) => s + TYPE[id].metricDimensions.width, 0) + CAB_GAP * (types.length - 1);
          rowSpaces.push({
            id: ids.row++, name: rowName, fqln: rowFqln, status: "A", positionOrder: "DESC",
            translation: [spot.x + r * ROW02_OFFSET, 0, spot.z],
            metricDimensions: {
              width: Number(length.toFixed(3)),
              height: Math.max(...types.map((id) => TYPE[id].metricDimensions.height)),
              depth: 1.2,
            },
          });
          types.forEach((id, k) => {
            const cabName = `CAB${String(k + 1).padStart(2, "0")}`;
            cabinetSpaces.push({
              id: ids.cabinet++, name: cabName, fqln: `${rowFqln}.${cabName}`, status: "A",
              type: TYPE[id], translation: [],
            });
          });
        });
      });
    }
  }
  return { mask, facilitySpace, sectorSpaces, podSpaces, rowSpaces, cabinetSpaces };
}

// * PNG (RGB, 8-bit) * //
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}
function writePng(file, mask) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(mask.w, 0);
  header.writeUInt32BE(mask.h, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  const stride = mask.w * 3;
  const raw = Buffer.alloc(mask.h * (stride + 1));
  for (let y = 0; y < mask.h; y++) mask.px.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]));
}

// * MAIN * //
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const wanted = process.argv.slice(2);
// Ids run across all facilities, so they stay the same whichever facilities are regenerated
const ids = { sector: 101, pod: 1001, row: 10001, cabinet: 100001 };
FACILITIES.forEach((f, index) => {
  const result = generateFacility(f, index, ids);
  if (wanted.length && !wanted.includes(f.name)) return;
  const dir = path.join(ROOT, "src/data", f.name);
  fs.mkdirSync(dir, { recursive: true });
  writeJson(path.join(dir, "facilitySpace.json"), result.facilitySpace);
  writeJson(path.join(dir, "sectorSpaces.json"), result.sectorSpaces);
  writeJson(path.join(dir, "podSpaces.json"), result.podSpaces);
  writeJson(path.join(dir, "rowSpaces.json"), result.rowSpaces);
  writeJson(path.join(dir, "cabinetSpaces.json"), result.cabinetSpaces);
  writePng(path.join(ROOT, "public/floors", `${f.name}.png`), result.mask);
  console.log(`${f.name}: ${result.sectorSpaces.length} halls, ${result.podSpaces.length} pods, ${result.cabinetSpaces.length} cabinets`);
});
if (!wanted.length) {
  writeJson(path.join(ROOT, "src/data/facilities.json"),
    FACILITIES.map((f, i) => ({ id: i + 1, name: f.name, fqln: `${FQLN_ROOT}.${f.name}` })));
  writeJson(path.join(ROOT, "src/data/cabinetTypes.json"), CABINET_TYPES);
}
