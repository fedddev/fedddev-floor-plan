<template>
  <cabinet
    v-for="c in cabinets"
    :key="c.id"
    :index="cabinets.indexOf(c)"
    :startPosition="cabinetStartPosition"
    :cabinet="c"
  ></cabinet>
</template>

<script lang="ts">
import { defineComponent, inject, toRefs, computed, provide } from "vue";
import {
  Vector3,
  Object3D,
  MathUtils,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from "three";
import Cabinet from "@components/Cabinet.vue";

export default defineComponent({
  components: {
    Cabinet,
  },
  props: {
    startPosition: {
      type: Vector3,
      required: true,
    },
    row: {
      type: Object,
      required: true,
    },
    isWireframe: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const parentScene = inject("podScene") as Object3D;

    const { cabinets }: any = toRefs(props.row._embedded);

    // * ROW 3D OBJECT * //
    // Setup Row Position
    const rowPosition = computed(() => {
      const x = props.startPosition.x + props.row.relativeTranslation[0];
      const y = props.startPosition.y + props.row.relativeTranslation[1];
      const z = props.startPosition.z + props.row.relativeTranslation[2];
      return new Vector3(x, y, z);
    });
    // Setup Row Rotation - which way Row is facing depending on whether it is a ROW01 or ROW02
    const rowRotation = computed(() => {
      if (props.row.name.indexOf("02") > -1) {
        return new Vector3(0, MathUtils.degToRad(90), 0);
      } else {
        return new Vector3(0, MathUtils.degToRad(-90), 0);
      }
    });
    // Setup Row Material
    const rowMaterial = computed(() => {
      return {
        color: 0xffffff,
        wireframe: props.isWireframe,
        transparent: !props.isWireframe,
        opacity: 0.0,
      };
    });
    // Setup Row Mesh Object
    const rowGeo = new BoxGeometry(
      props.row.metricWidth,
      props.row.metricHeight,
      props.row.metricDepth
    );
    const rowMat = new MeshStandardMaterial(rowMaterial.value);
    const rowScene = new Mesh(rowGeo, rowMat);
    rowScene.position.copy(rowPosition.value);
    rowScene.rotation.setFromVector3(rowRotation.value);
    // Add Row to Pod
    parentScene.add(rowScene);

    // Make Row available to Child Components
    provide("rowScene", rowScene);
    // Make array of cabinetWidths available to Cabinet component
    provide("cabinetWidths", props.row.metricCabinetWidths);

    // Setup Cabinet's starting point (0, 0, 0) at left-bottom-back corner of Row Box Geometry
    const cabinetStartPosition = computed(() => {
      return new Vector3(
        -props.row.metricWidth / 2,
        -props.row.metricHeight / 2,
        -props.row.metricDepth / 2
      );
    });

    return {
      cabinets,
      cabinetStartPosition,
    };
  },
});
</script>
