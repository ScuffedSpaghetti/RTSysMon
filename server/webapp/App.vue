<template>
	<div>
		<TopNav :info="info"/>
		<router-view :info="info"></router-view>
	</div>
	
</template>

<script>
import Vue from "vue"
import Test from "./components/Test.vue"
//import { AccumulationChartPlugin, ChartPlugin, PieSeries } from "@syncfusion/ej2-vue-charts"
import TopNav from "./components/TopNav.vue"
import lib from "./lib/lib.js"
import VueRouter from 'vue-router'
import Node from "./components/Node.vue"
import About from "./components/About.vue"
import Home from "./components/Home.vue"
import Settings from "./components/Settings.vue"

//Vue.use(AccumulationChartPlugin);
//Vue.use(ChartPlugin);
Vue.use(VueRouter)

const router = new VueRouter({
	base: "",
	routes:[
		{ path: '/node/:id', component: Node },
		{ path: '/', component: Home },
		{ path: '/about', component: About },
		{ path: '/settings', component: Settings },
		{ path: '/test', component: Test },
	],
})

export default {
	router:router,
	data(){
		return {
			animation: true,
			themeOverride: false,
			darkMode: false,
			showAboutPage: false,
			info: {},
		}
	},
	methods: {
		setDarkMode(enable){
			var darkModeElement = document.getElementById("dark-mode-style")
			if(enable && !darkModeElement) {
				darkModeElement = document.createElement("link")
				darkModeElement.href = "css/dark.css"
				darkModeElement.setAttribute("rel", "stylesheet")
				darkModeElement.setAttribute("id", "dark-mode-style")
				document.head.appendChild(darkModeElement)
			}
			if(!enable && darkModeElement) {
				document.head.removeChild(darkModeElement)
			}
		},
		messageHandler(message){
			//messages are received here
			if(message.type == "info"){
				this.info = message
    		}
			
			if(message.type == "settings"){
				this.showAboutPage = message.settings.show_about
				if(message.settings.default_theme){
					this.themeOverride = true
					if(message.settings.default_theme == 2){
						this.darkMode = true
					}else{
						this.darkMode = false
					}
				}
				if(message.settings.disable_animation){
					this.animation = false
				}
    		}
			//console.log(message)
		}
	},
	components:{
    TopNav,
},
	mounted() {
		try{
			var systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
			// this.setDarkMode(systemTheme.matches)
			if(!this.themeOverride){
				this.darkMode = systemTheme.matches
			}
			systemTheme.addEventListener(function(event) {
				// this.setDarkMode(event.matches)
				if(!this.themeOverride){
					this.darkMode = systemTheme.matches
				}
        	})
    	}catch(a){}
		lib.messageHandlers.push(this.messageHandler)
	},
	watch:{
		darkMode: {
			immediate: true,
			handler(darkMode){
				this.setDarkMode(darkMode)
			}
		}
	}
}
</script>

<style vsc-initialized>
.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}

.vsc-initialized {
	margin: 0em;
}

h1, p {
	margin: 1em;
}
</style>