<script lang="ts">
import { defineComponent } from "vue";
// import * as THREE from "three";
import {
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  MathUtils,
  DoubleSide,
} from "three";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default defineComponent({
  methods: {
    getScene() {
      // * DISPLAY LAYER * //
      const geometryFloor = new PlaneGeometry(1, 1, 1, 1);
      const materialFloor = new MeshStandardMaterial({
        color: 0xffe6e6,
        side: DoubleSide,
      });
      const floor = new Mesh(geometryFloor, materialFloor);
      floor.castShadow = false;
      floor.receiveShadow = false;
      floor.position.x = 0;
      floor.position.y = 0;
      floor.position.z = 0;
      floor.scale.x = 100;
      floor.scale.y = 100;
      floor.rotation.x = MathUtils.degToRad(90);
      // console.log('floor model: ', floor);
      return floor;
    },
  },
});
</script>
