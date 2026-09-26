<template>
  <div class="flex flex-col justify-center facility-card p-2 hover:bg-fd-surface">
    <div class="justify-center">
      <router-link :to="{name: 'Facility', params: {name: facilityName}}">
        <div class="transform hover:scale-110 transition duration-500 ease-in-out">
          <span class="fd-icon block h-[120px] w-[120px]" :style="{ '--icon': cssUrl(facilityLogoLarge) }" role="img" aria-label="Facility"></span>
        </div>
      </router-link>
    </div>
    <div class="text-xl text-center decoration-fd-link-underline decoration-[3px] underline-offset-4 hover:underline pt-3 pb-4 pl-2 pr-2">
      <router-link :to="{name: 'Facility', params: {name: facilityName}}">
          {{facilityName}}
      </router-link>
    </div>
  </div> 
</template>    

<script lang="ts">
import { defineComponent, toRef } from 'vue'
import facilityLogoLarge from '/facility-logo-large.svg'
import { cssUrl } from '@/utilities/cssUrl'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },    
  },
  setup(props) {
    const facilityName = toRef(props, "name").value;

    return {
      facilityName,
      facilityLogoLarge,
      cssUrl
    }
  },
})
</script>
