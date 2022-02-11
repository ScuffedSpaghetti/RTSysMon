//@ts-check

import { createApp } from "vue/dist/vue.runtime.esm-bundler";

//@ts-ignore
import App from "./App.vue";

console.log(createApp)

var app = createApp(App).mount("#app")
