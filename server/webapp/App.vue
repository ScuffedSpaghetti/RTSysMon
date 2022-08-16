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

router.beforeEach((to, from, next) => {
	var nextLocation = {
		path: to.path,
		hash: to.hash,
		query: to.query
	}
	console.log(to, from)
	var override = false
	/*if(nextLocation.hash == "" && from.hash != ""){
		nextLocation.hash = from.hash
		override = true
	}*/
	if(Object.keys(nextLocation.query).length == 0 && Object.keys(from.query).length != 0){
		nextLocation.query = from.query
		override = true
	}
	if(from.query.clearQuery !== undefined){
		console.log("clearQuery")
		override = false
	}
	if(override){
		console.log(nextLocation)
		next(nextLocation)
	}else{
		next()
	}
})

export default {
	router:router,
	data(){
		return {
			animation: true,
			themeOverride: false,
			darkMode: false,
			showAboutPage: false,
			
			animationInterval: undefined,
			animationLastTime: 0,
			
			autoScroll: false,
			autoScrollDirection: 1,
			autoScrollLastTime: 0,
			autoScrollLocation: 0,
			autoScrollSpeed: 50,
			autoScrollPauseUntil: 0,
			
			autoCycle: false,
			
			
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
				if(message.settings.default_theme && !this.themeOverride){
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
		},
		animationFrame(){
			var now = (performance||Date).now() / 1000
			var delta = now - (this.animationLastTime || now)
			//console.log(now)
			
			if(this.autoScroll){
				if(this.autoScrollPauseUntil < now){
					this.autoScrollLocation += delta * this.autoScrollSpeed * this.autoScrollDirection
					window.scrollTo(0,this.autoScrollLocation)
				}else{
					this.autoScrollLocation = window.scrollY
				}
				
				if (window.scrollY + window.innerHeight >= document.body.parentElement.scrollHeight) {
					this.autoScrollDirection = -1
				}
				if(this.autoScrollLocation <= 0){
					this.autoScrollDirection = 1
				}
			}
			
			
			this.animationLastTime = now
			cancelAnimationFrame(this.animationInterval)
			if(this.autoScroll || this.autoCycle){
				this.animationInterval = requestAnimationFrame(()=>{
					this.animationFrame()
				})
			}
		},
		scrollPause(event){
			if(Math.abs(window.scrollY - this.scrollLocation) > 20){
				var now = (performance||Date).now() / 1000
				this.scrollPauseUntil = now + 4
			}
			
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
		window.addEventListener("scroll",this.scrollPause)
	},
	beforeDestroy() {
		cancelAnimationFrame(this.animationInterval)
		this.autoScroll = false
		this.autoCycle = false
		window.removeEventListener("scroll",this.scrollPause)
	},
	watch:{
		darkMode: {
			immediate: true,
			handler(darkMode){
				this.setDarkMode(darkMode)
			}
		},
		$route:{
			immediate: true,
			handler(route){
				if(route.query.dark_mode !== undefined){
					this.themeOverride = true
					this.darkMode = true
				}
				if(route.query.light_mode !== undefined){
					this.themeOverride = true
					this.darkMode = false
				}
				if(route.query.auto_scroll !== undefined){
					this.scrollSpeed = parseFloat(route.query.auto_scroll) || 50
					this.scrollLocation = 0
					this.autoScroll = true
				}else{
					this.autoScroll = false
				}
				this.animationFrame()
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