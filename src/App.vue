<template>
  <navbar id="navbar"></navbar>
  <router-view :key="$route.fullPath" />
</template>

<script lang="ts">
import Navbar from "@components/tailwind/Navbar.vue";

export default {
  components: {
    Navbar,
  },
  setup() {},
};
</script>

<style>
body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
