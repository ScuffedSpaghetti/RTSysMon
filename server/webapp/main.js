//@ts-check

import { createApp } from "vue/dist/vue.runtime.esm-bundler"

//@ts-ignore
import App from "./App.vue"
// import Donut from 'vue-css-donut-chart'

console.log(createApp)

var app = createApp(App)
app.mount("#app")
// app.use(Donut)
