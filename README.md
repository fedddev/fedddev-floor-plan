# fedddev DCIM · 3D floor plan

**Live demo: [fedddev.github.io/fedddev-floor-plan](https://fedddev.github.io/fedddev-floor-plan/)**

An interactive 3D floor plan viewer for data centers. Pick one of seven facilities (DC01–DC07) and
explore its floor in the browser: about 920 containment pods and 20,500 cabinets, each placed from
layout data on top of the facility's floor plan drawing. The facilities are fictional - floor plans
and layouts are generated.

Built with Vue 3, TypeScript, three.js, Tailwind CSS and Vite.

## Highlights

- **Instanced rendering.** Cabinets and pods are drawn with `InstancedMesh`, so a facility with
  thousands of cabinets renders in a handful of draw calls.
- **Themed floor plans.** Each floor plan is a mask texture that a shader recolors, so the drawing
  follows the light/dark theme without separate images.
- **Two camera modes.** A perspective view you can orbit, and an orthographic birds-eye view.
- **Cabinet details.** Click a cabinet to see its ID and dimensions in a card anchored to it in the
  scene.
- **Generated facilities.** `scripts/generate-facilities.mjs` draws each facility's floor plan and
  fills its halls with pods and cabinets. See [src/data/README.md](src/data/README.md).

## Controls

| Input | Action |
|---|---|
| Drag | Pan |
| Right-drag | Rotate (perspective view) |
| Scroll | Zoom |
| Click a cabinet | Show its details |
| `v` | Toggle between perspective and birds-eye view |
| `t` | Show or hide pods |
| `u` | Show or hide the star sphere |
| Sun/moon icon | Toggle between light and dark theme |

## Run locally

```sh
npm install
npm run dev
```

Then open <http://localhost:8080/fedddev-floor-plan/>.

## Deploy

```sh
npm run deploy
```

This builds the app, adds a `404.html` copy of `index.html` so deep links such as
`/fedddev-floor-plan/facility/DC05` load on GitHub Pages, and publishes `dist/` to the `gh-pages` branch.
The site is served from the `gh-pages` branch at <https://fedddev.github.io/fedddev-floor-plan/>.
