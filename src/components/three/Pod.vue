<template>
  <row
    v-for="r of rows"
    :key="r.id"
    :startPosition="rowStartPosition"
    :row="r"
    :isWireframe="isWireframe"
  >
  </row>
</template>

<script lang="ts">
import { defineComponent, inject, toRefs, computed, provide } from "vue";
import { Vector3, Object3D, MathUtils } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { publicUrl } from "@/utilities/publicUrl";

// import Row from '@components/Row.vue'

export default defineComponent({
  components: {
    // Row
  },
  props: {
    startPosition: {
      type: Vector3,
      required: true,
    },
    pod: {
      type: Object,
      required: true,
    },
    isWireframe: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const parentScene = inject("sectorScene") as Object3D;

    const { rows }: any = toRefs(props.pod._embedded);

    // * Pod 3D OBJECT * //
    // Setup Pod Position
    const podPosition = computed(() => {
      const x = props.startPosition.x + props.pod.relativeTranslation[0];
      const y = props.startPosition.y + props.pod.relativeTranslation[1];
      const z = props.startPosition.z + props.pod.relativeTranslation[2];
      return new Vector3(x, y, z);
    });
    // Create Pod GLTF Model
    let podScene = new Object3D();
    const gltfPod = new GLTFLoader();
    gltfPod.load(publicUrl("Pod_fedddev.glb"), (gltf) => {
      gltf.scene.position.copy(podPosition.value);
      gltf.scene.rotation.y = MathUtils.degToRad(90);
      gltf.scene.scale.set(1, 1, 1);
      podScene.add(gltf.scene);
    });
    // Add Pod to Sector
    parentScene.add(podScene);

    // Make Pod Scene available to child components
    provide("podScene", podScene);

    // Setup Row's starting point (0, 0, 0) at left-bottom-back corner of Pod GLTF Model
    const rowStartPosition = computed(() => {
      const x = podPosition.value.x - props.pod.metricWidth / 2;
      const y = podPosition.value.y - props.pod.metricHeight / 2;
      const z = podPosition.value.z - props.pod.metricDepth / 2;
      return new Vector3(x, y, z);
    });

    return {
      rows,
      rowStartPosition,
    };
  },
});
</script>
