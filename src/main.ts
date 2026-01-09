import App from "@/App";
import router from "@/router";
import { createPinia } from "pinia";
import { createApp } from "vue";
import "./assets/css/main.css";
import { init } from "./database/api";

await init();

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
