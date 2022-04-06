<template>
	<div>
		<TopNav :info="info"/>
		<h1>The scuffed vue ui goes here</h1>
		<p>
			<Test/>
		</p>
	</div>
	
</template>

<script>
import Vue from "vue"
import Test from "./components/Test.vue"
import DonutChart from "./components/DonutChart.vue"
import { AccumulationChartPlugin, ChartPlugin, PieSeries } from "@syncfusion/ej2-vue-charts"
import TopNav from "./components/TopNav.vue"
import SmallComputerOverview from "./components/SmallComputerOverview.vue"
import lib from "./lib/lib.js"

Vue.use(AccumulationChartPlugin);
Vue.use(ChartPlugin);

export default {
	data(){
		return {
			animation: true,
			darkMode: false,
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
			//console.log(message)
		}
	},
	components:{
    Test,
    DonutChart,
    TopNav,
    SmallComputerOverview
},
	mounted() {
		try{
			var systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
			this.setDarkMode(systemTheme.matches)
			systemTheme.addEventListener(function(event) {
				this.setDarkMode(event.matches)
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

<style>
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