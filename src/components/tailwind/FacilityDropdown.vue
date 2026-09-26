<template>
  <!-- 
  The purpose of this component is to limit the amount of time the 'click' listener for dropdown close is open
  There is no reason for the listener to on all the time.
  Within this component, the listener is only added when this component is open - it is removed when this component is closed
 -->
  <div
    id="facility-dropdown"
    class="absolute top-11 overflow-hidden medium-gray-border dark-medium-gray-bg z-10 py-1"
  >
    <a
      v-for="(facility, index) in navbarFacilities"
      :key="index"
      class="block fd-link p-1 px-2"
    >
      <router-link :to="{ name: 'Facility', params: { name: facility } }">
        {{ facility }}
      </router-link>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, onMounted, onUnmounted } from "vue";

export default defineComponent({
  props: {
    facilities: {
      type: Array,
      required: true,
    },
  },
  emits: ["closeMenu"],
  setup(props, { emit }) {
    const navbarFacilities = toRef(props, "facilities").value as string[];

    function close(event: Event) {
      if ((event.target as HTMLElement).id !== "facility-dropdown") {
        emit("closeMenu");
      }
    }

    // This eventListener handling is the whole reason for the component
    onMounted(() => {
      document.addEventListener("click", close, true);
    });

    onUnmounted(() => {
      document.removeEventListener("click", close, true);
    });

    return {
      navbarFacilities,
    };
  },
});
</script>
