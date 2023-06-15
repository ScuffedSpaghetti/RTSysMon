//@ts-check

import Vue from "vue"
//@ts-ignore
import App from "./App.vue"

var app = new Vue(App)
//@ts-ignore
window.app = app

app.$mount("#app")
