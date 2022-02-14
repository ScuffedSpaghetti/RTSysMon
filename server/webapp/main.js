//@ts-check

// import { createApp } from "vue/dist/vue.runtime.esm-bundler"
import Vue from "vue"

//@ts-ignore
import App from "./App.vue"

// import Donut from 'vue-css-donut-chart'

//console.log(createApp)

var app = new Vue(App)



app.$mount("#app")
// app.use(Donut)
