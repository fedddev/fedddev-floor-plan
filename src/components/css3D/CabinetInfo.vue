<script lang="ts">
import { defineComponent, inject, onMounted, onUnmounted, toRef } from "vue";
import { Scene, Vector3, Event } from "three"; //Removed Color
import { CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer";

import closeButton from "/close-button.svg";
import { cssUrl } from "@/utilities/cssUrl";

export default defineComponent({
  props: {
    cabinet: {
      type: Object,
      required: true,
    },
    point: {
      type: Vector3,
      required: true,
    },
  },
  emits: ["closeCabinetInfo"],
  setup(props, { emit }) {
    // Declare props and inject
    const cabinet = toRef(props, "cabinet").value;
    const point = toRef(props, "point").value;
    const parentScene = inject("facilityCSS3DScene") as Scene;

    // Insert inline HTML into DOMParser to be rendered as a CSS3DSprite
    const cabinetContent = new DOMParser().parseFromString(
      `<div id="cabinet-info" class="grid gap-x-0 light-gray-border bubble-body ninety-opacity ">
        <div class="flex pl-10 col-span-2 dark-medium-gray-bg text-fd-text cursor-default pt-1">
          <span class="font-semibold">${
            cabinet.name
          }</span>
          <div class="ml-auto pr-1">
            <button type="button" class="h-4 w-4 cursor-default hover:text-fd-accent-cool" aria-label="Close">
              <span id="close-button" class="fd-icon h-4 w-4 mt-1"></span>
          </button>
          </div>
        </div>
        <hr class="col-span-2 hr-light-gray-solid">
          <div class="text-light-grey text-right">ID:</div>
          <div class="text-fd-text text-left tracking-normal font-semibold pl-2 pr-2">${
            cabinet.id
          }</div>
        <hr class="col-span-2 hr-dark-medium-gray-solid">
          <div class="text-light-grey text-right dark-gray-row-bg">Width:</div>
          <div class="text-fd-text text-left tracking-normal dark-gray-row-bg pl-2">${cabinet.type.metricDimensions.width?.toFixed(
            2
          )} <span class="text-xs pr-0.5">m</span></div>
        <hr class="col-span-2 hr-dark-medium-gray-solid">
          <div class="text-light-grey text-right">Depth:</div>
          <div class="text-fd-text text-left tracking-normal pl-2">${cabinet.type.metricDimensions.depth?.toFixed(
            2
          )} <span class="text-xs pr-0.5">m</span></div>
        <hr class="col-span-2 hr-dark-medium-gray-solid">
          <div class="text-light-grey text-right pl-3 dark-gray-row-bg pb-1">Height:</div>
          <div class="text-fd-text text-left tracking-tighter dark-gray-row-bg pl-2 pb-1">${cabinet.type.metricDimensions.height?.toFixed(
            2
          )} <span class="text-xs pr-0.5">m</span></div>
      </div>`,
      "text/html"
    );
    // Set after parsing - the inlined data: URL can't sit inside an HTML attribute string
    cabinetContent
      .querySelector<HTMLElement>("#close-button")
      ?.style.setProperty("--icon", cssUrl(closeButton));
    const css = new CSS3DSprite(cabinetContent.body);
    css.position.copy(
      // get x and z from point, set y to 3m
      new Vector3(point.x, 2.75, point.z)
    );
    css.scale.set(0.0075, 0.0075, 0.00075);
    parentScene.add(css);

    function handleClick(event: Event) {
      if ((event.target as HTMLElement).id === "close-button") {
        emit("closeCabinetInfo");
      }
    }

    onMounted(() => {
      css.element.addEventListener("click", handleClick);
    });

    onUnmounted(() => {
      css.parent?.remove(css);
      css.element.removeEventListener("click", handleClick);
    });

    return {
      handleClick,
      closeButton,
    };
  },
});
</script>
