<script lang="ts">
import { defineComponent, inject, toRef, ref, onMounted, watch } from "vue";
import {
  Vector3,
  Object3D,
  Mesh,
  InstancedMesh,
  Color,
  MathUtils,
  MeshStandardMaterial,
} from "three";
// @ts-ignore
import cabinetGlb from "/glbs/Cabinet_210903.glb";
import { RowSpace } from "@/models/rowSpace";
import { CabinetSpace } from "@/models/cabinetSpace";
import { getRowSpaces } from "@/data/helpers/getRowSpaces";
import { getCabinetSpaces } from "@data/helpers/getCabinetSpaces";
import { setRowSpaceDimensionsAndCabinetTranslations } from "@/data/helpers/setRowSpaceDimensionsAndCabinetTranslations";
import { loadGLTF } from "@/utilities/loadGLTF";
import {
  RPP_COLORS,
  SCENE_THEMES,
  SceneTheme,
} from "@/utilities/brandColors";
import { theme } from "@composables/useTheme";

// Which color a cabinet takes: its RPP feed (data - same in both modes), or null for an ordinary
// cabinet (the theme's neutral equipment color)
type CabinetRole = keyof typeof RPP_COLORS | null;

function roleColor(role: CabinetRole, sceneTheme: SceneTheme): Color {
  return new Color(role ? RPP_COLORS[role] : sceneTheme.cabinet);
}

const getCabinetStatus = (): "A" | "R" | "F" => {
  const random = Math.random();
  if (random < 0.9) {
    return "A";
  } else if (random < 0.95) {
    return "R";
  } else {
    return "F";
  }
};

export default defineComponent({
  props: {
    startPosition: {
      type: Vector3,
      required: true,
    },
    facilityName: {
      type: String,
      required: true,
    },
  },
  emits: ["cabinetSpaceData"],
  setup(props, { emit }) {
    const parentScene = inject("facilityScene") as Object3D;
    const startPos = toRef(props, "startPosition");
    const facilityName = toRef(props, "facilityName");
    let rowsRef = ref<RowSpace[]>([]);
    let cabinetsRef = ref<CabinetSpace[]>([]);

    const metricDimensionsAR3300: number[] = [0.599948, 1.991106, 1.199896];
    function cabinetScale(cab: CabinetSpace): Vector3 {
      /*
       *   All cabinet scaling is based on the AR3300, currently the most used cabinet type - as of 12/1/2020
       *   The metricDimensionsAR3300 are all set to scale "1 1 1"
       *   The width, height, and depth of the current cabinet are divided by the corresponding metricDimensionsAR3300
       *   The result gives us the scale of the cabinet
       */
      const scaleX =
        cab.type.metricDimensions.width / metricDimensionsAR3300[0];
      const scaleY =
        cab.type.metricDimensions.height / metricDimensionsAR3300[1];
      const scaleZ =
        cab.type.metricDimensions.depth / metricDimensionsAR3300[2];
      return new Vector3(scaleX, scaleY, scaleZ);
    }
    const baseCabinet = new Object3D();
    const instancedCabinets: InstancedMesh[] = [];
    let cabinetRoles: CabinetRole[] = [];
    function applyCabinetColors(): void {
      const sceneTheme = SCENE_THEMES[theme.value];
      for (const instancedCabinet of instancedCabinets) {
        cabinetRoles.forEach((role, index) =>
          instancedCabinet.setColorAt(index, roleColor(role, sceneTheme))
        );
        instancedCabinet.instanceColor!.needsUpdate = true;
      }
    }
    watch(theme, applyCabinetColors);
    onMounted(async () => {
      try {
        const rows = await getRowSpaces(facilityName.value);
        const cabinets = await getCabinetSpaces(facilityName.value);
        if (rows && cabinets) {
          const { updatedRows, updatedCabinets } =
            await setRowSpaceDimensionsAndCabinetTranslations(rows, cabinets);
          if (updatedRows.length === 0 || updatedCabinets.length === 0) {
            console.error("No rows or cabinets found");
          }
          cabinetsRef.value = updatedCabinets;
          rowsRef.value = updatedRows;
        }
        // Color role per cabinet, decided once so every part of a cabinet matches
        cabinetRoles = cabinetsRef.value.map((cabinet) => {
          if (getCabinetStatus() !== "R") return null;
          // RPP color type
          if (cabinet.type.id === 58) return "red";
          if (cabinet.type.id === 59) return "blue";
          if (cabinet.type.id === 60) return "grey";
          return null;
        });
        // This version traverses the glTF for its children.
        const gltfScene = await loadGLTF(cabinetGlb);
        if (!gltfScene) {
          console.log("there is no gltf.scene");
        }
        await gltfScene.traverse(async (child) => {
          if (child instanceof Mesh) {
            const childMesh = child as Mesh;
            const instancedCabinet = new InstancedMesh(
              childMesh.geometry,
              childMesh.material,
              cabinetsRef.value.length
            );
            instancedCabinet.name = `instancedCabinet-${gltfScene.children[0].children.indexOf(
              childMesh
            )}`;
            // loop over cabinetsRef.value to get positioning and rotation for cabinetsRef.value
            cabinetsRef.value.forEach((cabinet, cabinetIndex) => {
              const degrees = cabinet.rotationDegrees;
              const cabinetRotation = new Vector3(
                0,
                MathUtils.degToRad(degrees),
                0
              );
              const translation = cabinet.translation;
              const cabinetPosition = new Vector3(0, 0, 0);
              // if ROW01, adjust cabinet positioning
              if (degrees === 90) {
                cabinetPosition.copy(
                  new Vector3(
                    startPos.value.x +
                      translation[0] +
                      cabinet.type.metricDimensions.depth / 2,
                    startPos.value.y + translation[1],
                    startPos.value.z + translation[2]
                  )
                );
              } else {
                cabinetPosition.copy(
                  new Vector3(
                    startPos.value.x +
                      translation[0] -
                      cabinet.type.metricDimensions.depth / 2,
                    startPos.value.y + translation[1],
                    startPos.value.z +
                      translation[2] -
                      cabinet.type.metricDimensions.width
                  )
                );
              }

              baseCabinet.rotation.setFromVector3(cabinetRotation);
              baseCabinet.position.copy(cabinetPosition);
              baseCabinet.scale.copy(cabinetScale(cabinet));
              baseCabinet.updateMatrix();
              instancedCabinet.setMatrixAt(cabinetIndex, baseCabinet.matrix);
              instancedCabinet.instanceMatrix.needsUpdate = true;

              // * SET COLOR - neutral equipment, or the RPP feed color * //
              instancedCabinet.setColorAt(
                cabinetIndex,
                roleColor(cabinetRoles[cabinetIndex], SCENE_THEMES[theme.value])
              );
              // Flat, non-metallic finish so the instance colors show true (see brand/BRAND.md §8)
              if (childMesh.material instanceof MeshStandardMaterial) {
                const material =
                  instancedCabinet.material as MeshStandardMaterial;
                material.roughness = 1.0;
                material.metalness = 0;
                // The body's grey base color would dull every instance color
                if (material.name === "Body") {
                  material.color.set(0xffffff);
                }
              }

              instancedCabinet.instanceColor!.needsUpdate = true;
              instancedCabinet.layers.set(1);
              instancedCabinet.layers.enable(1);
            });
            instancedCabinets.push(instancedCabinet);
            parentScene.add(instancedCabinet);
          }
        });
        emit("cabinetSpaceData", cabinetsRef.value);
      } catch (e) {
        console.error("Error loading cabinet data or GLTF model:", e);
      }
    });
    return {
      startPos,
      cabinetScale,
      baseCabinet,
    };
  },
  render() {
    // console.log("cabinets done");
  },
});
</script>
