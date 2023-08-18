<template>
	<div>
		<div v-if="!connected" v-on:click="connect()" class="disconnected-popup">Disconnected</div>
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
		{ path: '/node/', component: Node },
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
	//console.log(to, from)
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
		//console.log("clearQuery")
		override = false
	}
	if(override){
		//console.log(nextLocation)
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
			dev: false,
			connected: false,
			showOverview: true,
			extraNavLinks: [],
			
			animationInterval: undefined,
			animationLastTime: 0,
			
			autoScroll: false,
			autoScrollDirection: 1,
			autoScrollLastTime: 0,
			autoScrollLocation: 0,
			autoScrollSpeed: 200,
			autoScrollAutoSpeed: true,
			autoScrollPauseUntil: 0,
			autoScrollLastPageHeight: 0,
			
			autoCycle: false,
			autoCycleHomeTime: 10,
			autoCycleNodeTime: 5,
			autoCycleElapsed: 0,
			autoCycleCurrentNode:-1,
			autoCycleOnNode: false,
			
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
				console.log(message.settings)
				this.extraNavLinks = message.settings.extra_nav_links || []
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
			//locally generated websocket connections status events
			if(message.type == "status"){
				this.connected = message.connected
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
				
				if (window.scrollY + window.innerHeight >= document.body.parentElement.scrollHeight - 1.5) {
					this.autoScrollDirection = -1
				}
				if(this.autoScrollLocation <= 1.5){
					this.autoScrollDirection = 1
				}
				if(this.autoCycle && this.autoScrollAutoSpeed){
					var totalTime = (this.autoCycleOnNode ? this.autoCycleNodeTime : this.autoCycleHomeTime)
					this.autoScrollSpeed = Math.max((document.body.parentElement.scrollHeight - window.innerHeight) / totalTime, 0)
				}
				this.autoScrollLastPageHeight = document.body.parentElement.scrollHeight
			}
			
			if(this.autoCycle){
				this.autoCycleElapsed += delta
				if(this.autoCycleElapsed > this.autoCycleHomeTime && this.autoCycleOnNode == false){
					this.autoCycleElapsed = 0
					this.autoCycleOnNode = true
					var individual = this.info?.individual
					if(individual){
						this.autoCycleCurrentNode = (this.autoCycleCurrentNode + 1) % (individual.length)
						this.autoScrollLocation = 0
						this.$router.push("/node/" + individual[this.autoCycleCurrentNode].uid).catch(()=>{})
					}
				}
				if(this.autoCycleElapsed > this.autoCycleNodeTime && this.autoCycleOnNode == true){
					this.autoCycleElapsed = 0
					this.autoCycleOnNode = false
					this.autoScrollLocation = 0
					this.$router.push("/").catch(()=>{})
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
			if(Math.abs(window.scrollY - this.autoScrollLocation) > 20 && !this.autoCycle && this.autoScrollLastPageHeight == document.body.parentElement.scrollHeight){
				var now = (performance||Date).now() / 1000
				this.autoScrollPauseUntil = now + 4
			}
			
		},
		connect(){
			lib.connect()
		},
		disconnect(){
			lib.disconnect()
		},
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
		lib.connect()
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
				console.log(route)
				this.dev = route.query.dev !== undefined
				if(route.query.dark_mode !== undefined){
					this.themeOverride = true
					this.darkMode = true
				}
				if(route.query.light_mode !== undefined){
					this.themeOverride = true
					this.darkMode = false
				}
				if(route.query.auto_scroll !== undefined){
					this.autoScrollSpeed = parseFloat(route.query.auto_scroll)
					this.autoScrollAutoSpeed = !this.autoScrollSpeed
					this.autoScrollSpeed = this.autoScrollSpeed || 200
					this.autoScrollLocation = 0
					this.autoScroll = true
				}else{
					this.autoScroll = false
				}
				if(route.query.auto_cycle !== undefined){
					var split = (route.query.auto_cycle || "").split(",")
					this.autoCycleHomeTime = parseFloat(split[0]) || 10
					this.autoCycleNodeTime = parseFloat(split[1]) || parseFloat(split[0]) || 5
					this.autoCycle = true
				}else{
					this.autoCycle = false
				}
				if(route.query.no_overview !== undefined){
					this.showOverview = false
				}else{
					this.showOverview = true
				}
				this.animationFrame()
			}
		}
	}
}
</script>

<style vsc-initialized>
/*.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}*/

.vsc-initialized {
	margin: 0em;
}
</style>