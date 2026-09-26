<script lang="ts">
import { defineComponent, inject, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { publicUrl } from '@/utilities/publicUrl';

export default defineComponent({
  props: {
    startPosition: {
      type: THREE.Vector3,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    cabinet: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const parentScene = inject('rowScene') as THREE.Object3D

    // cabinetWidths must be provided by parent Component - currently Row
    const cabinetWidths = inject('cabinetWidths') as Array<number>

    // * Cabinet 3D OBJECT * //
    // Setup Cabinet Position
    const cabinetPosition = computed(() => {
      // X position is total of all previous cabinet widths - cabinetWidths provided by parent (Row)
      let x = 0;      
      for (let i = 0; i < props.index; i++) {
          x += cabinetWidths[i];
      }
      const y = 0;
      const z = 0;
      return new THREE.Vector3(props.startPosition.x + x, props.startPosition.y + y, props.startPosition.z + z)
    })
    // Set Cabinet Scale
    // GLTF Model is based on the dimensions of the AR3300 cabinet, all scaling is derived from the dimensional differences of the Cabinet and the AR3300
    const metricDimensionsAR3300: Array<number> = [0.599948, 1.991106, 1.199896]
    const cabinetScale = computed(() => {
      /* 
      *   All cabinet scaling is based on the AR3300, currently the most used cabinet type - as of 12/1/2020
      *   The metricDimensionsAR3300 are all set to scale "1 1 1"
      *   The width, height, and depth of the current cabinet are divided by the corresponding metricDimensionsAR3300
      *   The result gives us the scale of the cabinet
      */
      const scaleX = props.cabinet.metricWidth/metricDimensionsAR3300[0];
      const scaleY = props.cabinet.metricHeight/metricDimensionsAR3300[1];
      const scaleZ = props.cabinet.metricDepth/metricDimensionsAR3300[2];
      return new THREE.Vector3(scaleX, scaleY, scaleZ)
    })
    // Create and Position Cabinet GLTF Model
    let cabinet = new THREE.Object3D
    const gltfCabinet = new GLTFLoader();
    gltfCabinet.load(publicUrl('cabinet_tuned_1C_T2.glb'),
        (gltf) => {
          gltf.scene.position.copy(cabinetPosition.value)
          gltf.scene.scale.copy(cabinetScale.value)
          cabinet.add(gltf.scene)
        }
    );
    parentScene.add(cabinet) 
  },
})
</script>
