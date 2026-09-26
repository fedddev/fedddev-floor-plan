<template>
  <all-pods
    :startPosition="facilityStartPosition"
    :facilityName="facilityNameRef"
    @podSpaceData="onPodSpaceData"
    v-if="showPods && isFacilityLoaded"
  >
  </all-pods>
  <all-cabinets
    :startPosition="facilityStartPosition"
    :facilityName="facilityNameRef"
    @cabinetSpaceData="onCabinetSpaceData"
    v-if="showCabinets && isFacilityLoaded"
  >
  </all-cabinets>
  <div v-if="selectedCabinets.length">
    <div v-for="cabinet in selectedCabinets" :key="cabinet.id">
      <cabinet-info
        :cabinet="cabinet"
        :point="selectedCabinetPoints[selectedCabinets.indexOf(cabinet)]"
        @closeCabinetInfo="clearCabinetSelection"
      >
      </cabinet-info>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  computed,
  ref,
  Ref,
  reactive,
  watch,
} from "vue";
import { useRoute } from "vue-router";

import {
  Scene,
  Vector3,
  PerspectiveCamera,
  OrthographicCamera,
  Mesh,
  Texture,
  Color,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

// Composables for setting up WebGL scene
import useWebGLScene from "@composables/three/useWebGLScene";
import usePerspectiveCamera, {
  framePerspectiveCamera,
} from "@composables/three/usePerspectiveCamera";
import useOrthographicCamera, {
  frameOrthographicCamera,
} from "@composables/three/useOrthographicCamera";
import useMapControls from "@composables/three/useMapControls";
import useFacilityModel from "@composables/three/useFacilityModel";
import useFloor, {
  FLOOR_NAME,
  setFloorColors,
} from "@composables/three/useFloor";
import { theme } from "@composables/useTheme";
import useVectorFloor from "@composables/three/useVectorFloor"; // PROTOTYPE
import { SCENE_THEMES } from "@/utilities/brandColors";
import useWebGLRenderer from "@composables/three/useWebGLRenderer";
import useRaycasting from "@composables/three/useRaycasting";

// Composables for css3D Scene
import { useCSS3DRenderer } from "@composables/css3D/useCSS3DRenderer";

// Composables for events
import useMouseMove from "@composables/events/useMouseMove";
import useKeypressHandler from "@composables/events/useKeypressHandler";
import useResizeHandler from "@composables/events/useResizeHandler";
import useIntersectHandler from "@composables/events/useIntersectHandler";

// Components
import AllCabinets from "@components/three/AllCabinets.vue";
import AllPods from "@components/three/AllPods.vue";
import CabinetInfo from "@components/css3D/CabinetInfo.vue";
import { FacilitySpace } from "@models/facilitySpace";
import { getFacilitySpace } from "@data/helpers/getFacilitySpace";
import { CabinetSpace } from "@models/cabinetSpace";
import { PodSpace } from "@/models/podSpace";
import { publicUrl } from "@/utilities/publicUrl";

export default defineComponent({
  components: {
    AllCabinets,
    AllPods,
    CabinetInfo,
  },
  setup() {
    // * DEBUG SETTINGS * //
    // If debugging, set to true
    const isWireframe = false;
    const isStats = true;
    const stats = isStats && new Stats();
    if (stats) {
      // Pin to the bottom-left so it doesn't cover the navbar
      stats.dom.style.top = "auto";
      stats.dom.style.bottom = "0";
    }
    // Turn on/off to debug
    const showPods = true;
    const showCabinets = true;

    // * ROUTER * //
    const route = useRoute();

    // * DATA * //
    const facilityNameRef = ref<string>(
      typeof route.params.name === "string"
        ? route.params.name
        : route.params.name[0]
    );
    const facilityRef = ref<FacilitySpace | null>(null);
    // Setup Sector's starting point (0, 0, 0) at left-bottom-back corner of Facility Box Geometry
    const facilityStartPosition = computed(() => {
      const x = facilityRef.value?.metricDimensions?.width
        ? -facilityRef.value.metricDimensions?.width / 2
        : 0;
      const y = 0;
      const z = facilityRef.value?.metricDimensions?.depth
        ? -facilityRef.value.metricDimensions?.depth / 2
        : 0;
      return new Vector3(x, y, z);
    });
    // pods and cabinets read facilityStartPosition once when they mount - wait for the
    // facility data so they don't get placed at (0, 0, 0) without the facility offset
    const isFacilityLoaded = computed(
      () => !!facilityRef.value?.metricDimensions
    );

    // * NAVBAR INFO * //
    const headerHeightRef = ref<number>(
      (document.querySelector("#navbar")
        ? document.querySelector<HTMLElement>("#navbar")?.offsetHeight
        : 0) as number
    );

    // * SCENE * //
    const webGLScene = useWebGLScene(SCENE_THEMES[theme.value].background);
    const css3DScene = new Scene();

    // * RENDERER w/ default CANVAS * //
    const canvasWidthRef = ref(document.documentElement.clientWidth);
    const canvasHeightRef = ref(
      document.documentElement.clientHeight - headerHeightRef.value
    );
    const webGLRenderer = useWebGLRenderer(
      canvasWidthRef.value,
      canvasHeightRef.value
    );
    const css3DRenderer = useCSS3DRenderer(
      canvasWidthRef.value,
      canvasHeightRef.value,
      headerHeightRef.value
    );

    // * CAMERA * //
    const isOrtho = ref(false);
    // * PERSPECTIVE (MAIN) AND CONTROLS* //
    const perspCamera = reactive(
      usePerspectiveCamera(
        facilityRef.value && facilityRef.value.metricDimensions
          ? facilityRef.value.metricDimensions.width
          : 0,
        canvasWidthRef.value,
        canvasHeightRef.value
      )
    );
    const perspMapControlsRef = useMapControls(
      perspCamera as PerspectiveCamera,
      css3DRenderer.domElement
    );
    // * ORTHOGRAPHIC (SECONDARY) AND CONTROLS * //
    const orthoCamera = reactive(
      useOrthographicCamera(
        facilityRef.value && facilityRef.value.metricDimensions
          ? facilityRef.value.metricDimensions.width
          : 0,
        facilityRef.value && facilityRef.value.metricDimensions
          ? facilityRef.value.metricDimensions.depth
          : 0,
        canvasWidthRef.value,
        canvasHeightRef.value
      )
    );
    const orthoMapControlsRef = useMapControls(
      orthoCamera as OrthographicCamera,
      css3DRenderer.domElement
    );
    orthoMapControlsRef.value.enabled = false; // initialize to false to avoid conflict with perspMapControlsRef
    // * ACTIVE CAMERA * //
    const activeCameraRef = ref();
    activeCameraRef.value = perspCamera;
    webGLScene.add(activeCameraRef.value);

    // * RAYCASTER * //
    const { raycasterRef, mouseRef } = useRaycasting();
    raycasterRef.value.setFromCamera(mouseRef.value, activeCameraRef.value);

    // * EVENTS * //
    // Cabinet Selection
    function clearCabinetSelection(): void {
      selectedCabinets.value.length = 0;
      selectedCabinetPoints.value.length = 0;
    }
    // Cabinet Click
    function handleIntersects(event: MouseEvent) {
      useIntersectHandler(
        event,
        raycasterRef,
        webGLScene,
        cabinets,
        selectedCabinets,
        selectedCabinetPoints,
        clearCabinetSelection
      );
    }
    css3DRenderer.domElement.addEventListener("click", handleIntersects, true);

    // * WATCH CAMERA TYPE * //
    watch(
      () => isOrtho.value,
      (newValue: boolean) => {
        webGLScene.remove(activeCameraRef.value);
        if (newValue === true) {
          perspMapControlsRef.value.enabled = !newValue;
          orthoMapControlsRef.value.enabled = newValue;
          activeCameraRef.value = orthoCamera;
        } else {
          orthoMapControlsRef.value.enabled = newValue;
          perspMapControlsRef.value.enabled = !newValue;
          activeCameraRef.value = perspCamera;
        }
        //@ts-ignore
        raycasterRef.value.setFromCamera(mouseRef.value, activeCameraRef.value);
        webGLScene.add(activeCameraRef.value);
      }
    );

    // * FACILITY 3D OBJECT METHODS * //
    function facilityDestroy(scene: Scene): void {
      scene.remove.apply(scene, scene.children);
    }
    // Free GPU memory held by meshes (geometries, materials, textures)
    function facilityDispose(scene: Scene): void {
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          for (const material of materials) {
            for (const value of Object.values(material)) {
              if (value instanceof Texture) {
                value.dispose();
              }
            }
            material.dispose();
          }
        }
      });
    }
    function facilityInit(
      scene: Scene,
      facilityData: FacilitySpace | null
    ): void {
      if (facilityData && isWireframe) {
        const facilityModel =
          facilityData.metricDimensions &&
          useFacilityModel(
            facilityData.metricDimensions.width,
            facilityData.metricDimensions.height,
            facilityData.metricDimensions.depth,
            facilityData.name,
            isWireframe
          );
        if (facilityModel) {
          scene.add(facilityModel);
        }
      }
      // PROTOTYPE: vector floor behind ?vectorfloor
      if (
        facilityData?.metricDimensions &&
        location.search.includes("vectorfloor")
      ) {
        const { width, depth } = facilityData.metricDimensions;
        useVectorFloor(
          publicUrl(`floors/${facilityData.name}-vector.json`),
          width,
          depth,
          SCENE_THEMES[theme.value].floor
        ).then((floor) => scene.add(floor));
        return;
      }
      const floor =
        facilityData &&
        facilityData.metricDimensions &&
        useFloor(
          facilityData.metricDimensions.width || 0,
          facilityData.metricDimensions.depth || 0,
          facilityData.name || "",
          SCENE_THEMES[theme.value].floor
        );
      if (floor) {
        scene.add(floor);
      }
    }

    // * WATCH THEME - recolor background and floor (cabinets/pods watch it themselves) * //
    watch(theme, (newTheme) => {
      const sceneTheme = SCENE_THEMES[newTheme];
      (webGLScene.background as Color).set(sceneTheme.background);
      const floor = webGLScene.getObjectByName(FLOOR_NAME);
      if (floor instanceof Mesh) {
        setFloorColors(floor, sceneTheme.floor);
      }
    });

    // * WATCH ROUTE / CHANGE FACILITY DATA * //
    watch(
      () => route.params.name,
      (newValue: string | string[]) => {
        if (newValue) {
          // Handling if newValue is a string or an array
          facilityNameRef.value =
            typeof newValue === "string" ? newValue : newValue[0];
          facilityDestroy(webGLScene);
          facilityInit(webGLScene, facilityRef.value ?? facilityRef.value);
        }
      }
    );

    // * RENDER LOOP - RECURSIVE * //
    let animationFrameId = 0;
    const animate = () => {
      perspMapControlsRef.value.update();
      orthoMapControlsRef.value.update();
      raycasterRef.value.setFromCamera(mouseRef.value, activeCameraRef.value);
      webGLRenderer.render(webGLScene, activeCameraRef.value);
      css3DRenderer.render(css3DScene, activeCameraRef.value);
      if (isStats) {
        stats.update();
      }
      animationFrameId = window.requestAnimationFrame(animate);
    };

    // * Methods * //
    // Window Events
    function handleResize() {
      useResizeHandler(
        canvasWidthRef,
        canvasHeightRef,
        headerHeightRef,
        perspCamera as PerspectiveCamera,
        orthoCamera as OrthographicCamera,
        webGLRenderer,
        css3DRenderer
      );
    }
    function handleKeypress(event: KeyboardEvent) {
      useKeypressHandler(event, isOrtho, activeCameraRef, webGLScene);
    }

    // Provide scenes so child components can refer to it
    provide("facilityScene", webGLScene);
    provide("facilityCSS3DScene", css3DScene);
    let cabinets: CabinetSpace[] = [];
    let onCabinetSpaceData = async (value: CabinetSpace[]) => {
      cabinets = await value;
    };
    let pods: PodSpace[] = [];
    let onPodSpaceData = async (value: PodSpace[]) => {
      pods = await value;
    };
    const selectedCabinets = ref([]) as Ref<any[]>;
    const selectedCabinetPoints = ref([]) as Ref<Vector3[]>;

    onMounted(async () => {
      headerHeightRef.value = (
        document.querySelector("#navbar")
          ? document.querySelector<HTMLElement>("#navbar")?.offsetHeight
          : 0
      ) as number;
      // Need access to Vue's app instance to target where to render the THREE scene
      document.querySelector("#app")?.append(webGLRenderer.domElement);
      facilityRef.value = (await getFacilitySpace(
        facilityNameRef.value
      )) as FacilitySpace;
      // Cameras were created before facility data loaded - frame them to the facility now
      const dimensions = facilityRef.value.metricDimensions;
      if (dimensions) {
        framePerspectiveCamera(perspCamera as PerspectiveCamera, dimensions.width);
        frameOrthographicCamera(
          orthoCamera as OrthographicCamera,
          dimensions.width,
          dimensions.depth,
          canvasWidthRef.value,
          canvasHeightRef.value
        );
      }
      // This allows MouseMove to target the css3DRenderer domElement
      css3DRenderer.domElement.id = "css3DRenderer";
      document.querySelector("#app")?.append(css3DRenderer.domElement);
      useMouseMove(css3DRenderer.domElement, mouseRef.value);
      window.addEventListener("resize", handleResize, true);
      window.addEventListener("keyup", handleKeypress, true);
      if (isStats) {
        document.querySelector("#app")?.appendChild(stats.dom);
      }
      facilityInit(webGLScene, facilityRef.value);
      animate();
    });

    onUnmounted(() => {
      // Stop the render loop, otherwise it keeps rendering the old scene
      window.cancelAnimationFrame(animationFrameId);
      css3DRenderer.domElement.removeEventListener(
        "click",
        handleIntersects,
        true
      );
      perspMapControlsRef.value.dispose();
      orthoMapControlsRef.value.dispose();
      document.querySelector("#app")?.removeChild(webGLRenderer.domElement);
      document.querySelector("#app")?.removeChild(css3DRenderer.domElement);
      window.removeEventListener("resize", handleResize, true);
      window.removeEventListener("keyup", handleKeypress, true);
      if (isStats) {
        document.querySelector("#app")?.removeChild(stats.dom);
      }
      facilityDispose(webGLScene);
      facilityDestroy(webGLScene);
      // Release the WebGL context - browsers cap live contexts and block the
      // page after repeated context loss
      webGLRenderer.dispose();
      webGLRenderer.forceContextLoss();
    });

    // Make sector props available to pass via the template
    return {
      showPods,
      showCabinets,
      facilityNameRef,
      onCabinetSpaceData,
      onPodSpaceData,
      selectedCabinets,
      selectedCabinetPoints,
      facilityStartPosition,
      isFacilityLoaded,
      clearCabinetSelection,
      pods,
    };
  },
});
</script>
