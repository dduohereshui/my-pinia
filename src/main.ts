import { App, createApp } from "vue";
import AppVue from "./App.vue";
import { createPinia } from "@/pinia";
const pinia = createPinia();
const app: App = createApp(AppVue);
app.use(pinia);
app.mount("#app");
