<template>
  <header
    class="flex w-screen h-12 bg-fd-bg text-fd-text titlebar-border items-center justify-between px-6 z-10"
  >
    <!-- left -->
    <!-- Lockup: official fedddev wordmark for the active theme + DCIM product label
         (Michroma, allowed for short caps labels; spaced by the wordmark's clear space - brand/BRAND.md §3, §5) -->
    <router-link to="/" exact class="flex items-center gap-4" aria-label="fedddev DCIM home">
      <img :src="wordmark" alt="fedddev" class="block h-6" />
      <span class="font-brand text-[22px] leading-none tracking-wide pt-px">DCIM</span>
    </router-link>

    <!-- right -->
    <!-- Accounts Button & Dropdown -->
    <div class="flex items-center h-full">
      <!-- MENU -->
      <!-- Facility Button -->
      <div class="flex items-center h-full">
        <button
          id="facility-dropdown-button"
          type="button"
          class="group flex items-center gap-2"
          @click.stop="facilityOpen = !facilityOpen"
        >
          <span
            class="text-xs leading-tight text-center decoration-fd-link-underline decoration-[3px] underline-offset-4 group-hover:underline group-focus-visible:underline"
          >
            Choose<br />Facility
          </span>
          <span
            class="fd-icon h-9 w-9 group-hover:text-fd-accent-cool group-focus-visible:text-fd-accent-cool"
            :style="{ '--icon': cssUrl(facilityLogo) }"
            role="img"
            aria-label="Facility"
          ></span>
        </button>
        <!-- Facility Name -->
        <router-link
          v-if="facilityNameRef"
          to="/"
          class="fd-link text-xl leading-none pl-3 pr-1"
        >
          <span class="text-sm">></span>
          {{ facilityNameRef }}
        </router-link>
        <div class="vertical-divider m-3"></div>
        <!-- Facility Dropdown -->
        <facility-dropdown
          :facilities="facilities"
          v-if="facilityOpen"
          @closeMenu="closeMenus"
        ></facility-dropdown>
      </div>
      <!-- Theme toggle -->
      <button
        type="button"
        class="flex items-center justify-center h-11 w-11 hover:text-fd-accent-cool focus-visible:text-fd-accent-cool"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="theme === 'dark' ? 'Light theme' : 'Dark theme'"
        @click="toggleTheme"
      >
        <!-- sun (shown in dark mode) -->
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
        <!-- moon (shown in light mode) -->
        <svg v-else viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      </button>
      <div class="flex items-center">
        <button
          id="account-dropdown-button"
          type="button"
          class="flex items-center justify-center h-11 w-11 hover:text-fd-accent-cool focus-visible:text-fd-accent-cool"
          aria-label="Account"
          @click.stop="accountOpen = !accountOpen"
        >
          <!-- <p class="block pr-2"> {{ auth._userInfo?.name }} </p> -->
          <span
            class="fd-icon h-6 w-6"
            :style="{ '--icon': cssUrl(accountLogo) }"
          ></span>
        </button>
      </div>
      <!-- <account-dropdown
        :auth="auth"
        v-if="accountOpen"
        @closeMenu="closeMenus"
      ></account-dropdown> -->
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

import FacilityDropdown from "@components/tailwind/FacilityDropdown.vue";
// import AccountDropdown from '@components/tailwind/AccountDropdown.vue'
import facilityLogo from "/facility-logo.svg";
import accountLogo from "/account-logo.svg";
import { theme, toggleTheme } from "@composables/useTheme";
import { cssUrl } from "@/utilities/cssUrl";
import { publicUrl } from "@/utilities/publicUrl";

export default defineComponent({
  components: {
    FacilityDropdown,
    // AccountDropdown
  },
  setup() {
    const route = useRoute();
    const facilityNameRef = ref(route.params.name);
    const facilities = [
      "DC01",
      "DC02",
      "DC03",
      "DC04",
      "DC05",
      "DC06",
      "DC07",
    ];

    // let auth = inject('auth') as Ref<IAMClient>;
    // console.log('auth: ', auth)

    const facilityOpen = ref(false);
    const accountOpen = ref(false);

    watch(
      () => route.params.name,
      (newValue) => {
        facilityNameRef.value = newValue;
        closeMenus();
      }
    );

    function closeMenus() {
      // un-highlight buttons
      document.getElementById("facility-dropdown-button")?.blur();
      document.getElementById("account-dropdown-button")?.blur();
      // close dropdown menus
      facilityOpen.value = accountOpen.value = false;
    }

    // Official wordmark file for the active theme (never recolored - brand/BRAND.md §3)
    const wordmark = computed(
      () => publicUrl(`brand/fedddev-wordmark-${theme.value}.svg`)
    );

    return {
      facilityNameRef,
      facilities,
      // auth,
      facilityOpen,
      accountOpen,
      closeMenus,
      theme,
      toggleTheme,
      wordmark,
      facilityLogo,
      accountLogo,
      cssUrl,
    };
  },
});
</script>
