import { createApp } from "vue";
import "../brand/tokens.css";
import "./styles/app.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);
router.app = app;
app.mount("#app");
