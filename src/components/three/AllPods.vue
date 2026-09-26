<script lang="ts">
import { defineComponent, inject, toRef, onMounted, watch } from "vue";
import {
  Vector3,
  Object3D,
  Mesh,
  InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
} from "three";
import { getPodSpaces } from "../../data/helpers/getPodSpaces";
import { PodSpace } from "@/models/podSpace";
import { loadGLTF } from "../../utilities/loadGLTF";
import { SCENE_THEMES } from "../../utilities/brandColors";
import { theme } from "../../composables/useTheme";
import { publicUrl } from "@/utilities/publicUrl";

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
  emits: ["podSpaceData"],
  setup(props, { emit }) {
    // console.log("startPos: ", props.startPosition);
    const parentScene = inject("facilityScene") as Object3D;
    const startPos = toRef(props, "startPosition");
    const facilityName = toRef(props, "facilityName").value;
    const basePod = new Object3D();
    const bodyMaterials: MeshStandardMaterial[] = [];
    watch(theme, (newTheme) => {
      for (const material of bodyMaterials) {
        material.color.setHex(SCENE_THEMES[newTheme].pod);
      }
    });

    onMounted(async () => {
      try {
        const podSpaces = (await getPodSpaces(
          facilityName
        )) as PodSpace[];
        const count = podSpaces.length;
        const gltfScene = await loadGLTF(publicUrl("glbs/Pod_fedddev.glb"));
        if (!gltfScene) {
          console.log("there is no gltf.scene");
          return;
        }
        await gltfScene.traverse(async (child) => {
          if (child instanceof Mesh) {
            const childMesh = child as Mesh;
            // Flat, non-metallic finish - metal only shows reflections, not its own color
            if (childMesh.material instanceof MeshStandardMaterial) {
              childMesh.material.metalness = 0;
              childMesh.material.roughness = Math.max(
                childMesh.material.roughness,
                0.8
              );
            }
            // Pod containment body - the scene's dominant equipment color (brand/BRAND.md §8a)
            if (
              childMesh.material instanceof MeshStandardMaterial &&
              childMesh.material.name === "Green_Powder_Coat"
            ) {
              bodyMaterials.push(childMesh.material);
              childMesh.material.color.setHex(SCENE_THEMES[theme.value].pod);
            }
            const instancedPod = new InstancedMesh(
              childMesh.geometry,
              childMesh.material,
              count
            );
            instancedPod.name = `pod-${gltfScene.children.indexOf(
              childMesh
            )}`;
            for (const pod of podSpaces) {
              if (pod) {
                basePod.scale.set(1, 1, 1);
                basePod.rotation.setFromVector3(
                  new Vector3(0, MathUtils.degToRad(-90), 0)
                );
                if (pod.translation) {
                  const podPosition = new Vector3(
                    startPos.value.x + pod.translation[0],
                    startPos.value.y + pod.translation[1],
                    startPos.value.z + pod.translation[2]
                  );
                  basePod.position.copy(podPosition);
                  basePod.updateMatrix();
                  instancedPod.setMatrixAt(
                    podSpaces.indexOf(pod),
                    basePod.matrix
                  );
                  instancedPod.layers.set(2);
                }
              }
            }
            parentScene.add(instancedPod);
          }
        });
        // console.log("parentScene", parentScene);
        emit("podSpaceData", podSpaces);
      } catch (error) {
        console.error("Error loading Pod data or GLTF model:", error);
      }
    });

    return {
      startPos,
      basePod,
    };
  },
  render() {
    // console.log("pods done");
  },
});
</script>
