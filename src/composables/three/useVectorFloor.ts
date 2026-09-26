// PROTOTYPE: vector floor plan - traced paths as merged geometry, repeated symbols as InstancedMesh.
// Enabled with ?vectorfloor on a facility that has /floors/{NAME}-vector.json.
import {
  BufferGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShapeGeometry,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { SceneTheme } from "@/utilities/brandColors";

interface VectorFloorData {
  width: number; // source pixels
  height: number;
  symbols: { layer: number; d: string }[];
  instances: [number, number, number][]; // symbol index, x, y (px)
  paths: { layer: number; x: number; y: number; d: string }[];
}

const svgLoader = new SVGLoader();
function shapesFromPath(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}" fill-rule="evenodd"/></svg>`;
  return svgLoader.parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
}

export default async function useVectorFloor(
  url: string,
  width: number,
  depth: number,
  colors: SceneTheme["floor"]
): Promise<Group> {
  const data: VectorFloorData = await (await fetch(url)).json();

  const materials: Record<number, MeshBasicMaterial> = {
    1: new MeshBasicMaterial({ color: colors.primary, side: DoubleSide, toneMapped: false }),
    2: new MeshBasicMaterial({ color: colors.secondary, side: DoubleSide, toneMapped: false }),
  };
  const lines = new Group();

  // Unique line work: one merged mesh per layer
  for (const layer of [1, 2]) {
    const geometries: BufferGeometry[] = [];
    for (const path of data.paths.filter((p) => p.layer === layer)) {
      const geometry = new ShapeGeometry(shapesFromPath(path.d), 2);
      geometry.translate(path.x, path.y, 0);
      geometries.push(geometry);
    }
    if (!geometries.length) continue;
    const merged = mergeGeometries(geometries);
    geometries.forEach((g) => g.dispose());
    lines.add(new Mesh(merged, materials[layer]));
  }

  // Repeated symbols: one InstancedMesh each
  const placements = new Map<number, [number, number][]>();
  for (const [symbol, x, y] of data.instances) {
    if (!placements.has(symbol)) placements.set(symbol, []);
    placements.get(symbol)!.push([x, y]);
  }
  const matrix = new Matrix4();
  placements.forEach((spots, symbolIndex) => {
    const symbol = data.symbols[symbolIndex];
    const geometry = new ShapeGeometry(shapesFromPath(symbol.d), 2);
    const mesh = new InstancedMesh(geometry, materials[symbol.layer], spots.length);
    spots.forEach(([x, y], i) => mesh.setMatrixAt(i, matrix.makeTranslation(x, y, 0)));
    lines.add(mesh);
  });

  // Source pixels (x right, y down) -> facility metres on the floor plane (x, z)
  lines.scale.set(width / data.width, depth / data.height, 1);
  lines.rotation.x = MathUtils.degToRad(90);
  lines.position.set(-width / 2, 0.01, -depth / 2);

  const base = new Mesh(
    new PlaneGeometry(width, depth),
    new MeshBasicMaterial({ color: colors.base, toneMapped: false })
  );
  base.rotation.x = MathUtils.degToRad(-90);

  const floor = new Group();
  floor.add(base, lines);
  return floor;
}
