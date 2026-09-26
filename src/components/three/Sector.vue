<script lang="ts">
import { defineComponent, inject, toRefs, computed, provide } from "vue";
import {
  Object3D,
  Vector3,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from "three";

// import Pod from '@components/Pod.vue'

export default defineComponent({
  components: {
    // Pod,
  },
  props: {
    startPosition: {
      type: Vector3,
      required: true,
    },
    isWireframe: {
      type: Boolean,
      required: true,
    },
    sector: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const parentScene = inject("facilityScene") as Object3D;

    const { pods }: any = toRefs(props.sector._embedded);

    // * SECTOR 3D OBJECT * //
    // Setup Sector Dimensions
    const sectorWidth = computed(() => {
      const upperLeft = props.sector.bounds.find((bound: any) =>
        bound.name.includes(props.sector.name + ".UPPER_LEFT")
      ).translation;
      const upperRight = props.sector.bounds.find((bound: any) =>
        bound.name.includes(props.sector.name + ".UPPER_RIGHT")
      ).translation;
      return Math.abs(upperLeft[0] - upperRight[0]);
    });
    const sectorHeight = computed(() => {
      return 7;
    });
    const sectorDepth = computed(() => {
      const upperLeft = props.sector.bounds.find((bound: any) =>
        bound.name.includes(props.sector.name + ".UPPER_LEFT")
      ).translation;
      const lowerLeft = props.sector.bounds.find((bound: any) =>
        bound.name.includes(props.sector.name + ".LOWER_LEFT")
      ).translation;
      return Math.abs(upperLeft[2] - lowerLeft[2]);
    });
    // Setup Sector Positioning
    // generating UpperLeftBound (Bird's Eye perspective) to get absolute positioning of Sector
    const upperLeftBound = props.sector.bounds.find((bound: any) =>
      bound.name.includes(props.sector.name + ".UPPER_LEFT")
    ).translation;
    // adding sectorWidth.value/2 so that the center of the sector is not generated at the upperLeftBound
    const sectorPosition = computed(() => {
      const x =
        props.startPosition.x + upperLeftBound[0] + sectorWidth.value / 2;
      const y = sectorHeight.value / 2;
      const z =
        props.startPosition.z + upperLeftBound[2] + sectorDepth.value / 2;
      return new Vector3(x, y, z);
    });
    // Setup Sector Material
    const sectorMaterial = computed(() => {
      return {
        color: 0x000000,
        wireframe: props.isWireframe,
        transparent: !props.isWireframe,
        opacity: 0.0,
      };
    });
    // Setup Facility Mesh Object
    const secGeo = new BoxGeometry(
      sectorWidth.value,
      sectorHeight.value,
      sectorDepth.value
    );
    const secMat = new MeshStandardMaterial(sectorMaterial.value);
    const sectorScene = new Mesh(secGeo, secMat);
    sectorScene.position.copy(sectorPosition.value);

    // Add Sector to Facility
    parentScene.add(sectorScene);

    // Make sectorScene available to child components
    provide("sectorScene", sectorScene);

    // Setup Pod's starting point (0, 0, 0) at left-bottom-back corner of Sector Box Geometry
    const podStartPosition = computed(() => {
      const x = -sectorWidth.value / 2;
      const y = -sectorHeight.value / 2;
      const z = -sectorDepth.value / 2;
      return new Vector3(x, y, z);
    });

    // Make pod  props available to pass via the template
    return {
      pods,
      podStartPosition,
    };
  },
});
</script>
