<template>
  <body class="mt-10 text-fd-text antialiased p-2 h-screen">
    <div class="pb-6">
      <div class="text-center text-xl">Choose Facility</div>
    </div>
    <div class="grid grid-flow-col gap-3 sm:grid-rows-2 justify-center">
      <div v-for="(facility, index) in facilities" :key="index">
        <facility-card :name="facility"></facility-card>
      </div>
    </div>
  </body>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import FacilityCard from "@components/tailwind/FacilityCard.vue";

export default defineComponent({
  components: {
    FacilityCard,
  },
  setup() {
    const facilities = [
      "DC01",
      "DC02",
      "DC03",
      "DC04",
      "DC05",
      "DC06",
      "DC07",
    ];

    return {
      facilities,
    };
  },
});
</script>
