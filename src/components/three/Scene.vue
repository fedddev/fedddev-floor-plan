<script>
import { h, resolveComponent } from 'vue'


// SUPPOSED TO BE A PARENT 'SCENE' COMPONENT TO CONFIGURE ANY SHARED BOILERPLATE FOR FACILITY AND GLOBE VIEWS
export default {
  setup() {
    return () => h(resolveComponent('router-view'))
  }
}
</script>