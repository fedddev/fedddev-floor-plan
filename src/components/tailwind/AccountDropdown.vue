<template>
  <!-- 

  The purpose of this component is to limit the amount of time the 'click' listener for dropdown close is open
  There is no reason for the listener to on all the time.
  Within this component, the listener is only added when this component is open - it is removed when this component is closed

 -->
  <div
    id="account-dropdown"
    class="absolute right-7 top-8 overflow-hidden dark-medium-gray-bg z-10 py-1 text-align-right"
  >
    <div class="block text-fd-text p-1 px-2">
      <!-- <button class="block" @click="handleLogout">Logout</button> -->
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  // toRef,
  onMounted,
  onUnmounted,
  PropType,
} from "vue";

export default defineComponent({
  props: {
    auth: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  emits: ["closeMenu"],
  setup(props, { emit }) {
    // const navbarAuth = toRef(props, "auth").value;
    // const handleLogout = () => {
    //   navbarAuth.signout();
    // };
    if (!props.auth) {
      console.warn("Auth prop is not provided");
    }
    function close(event: Event) {
      if ((event.target as HTMLElement).id !== "account-dropdown") {
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
      //   navbarAuth,
      // handleLogout,
    };
  },
});
</script>
