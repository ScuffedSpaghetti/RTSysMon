<template>
	<div>
		<div>
			<DonutChart :usage="usage" :size="20"/>
			<HorizontalBar :usage="usage" :width="20" :height="20" />
		</div>
		<br>
		<div><LargeComputerOverview :info="averageData" :compHeight="14" :compWidth="30" /></div>
		<br>
		<div class="container"><SmallComputerOverview v-for="i in 10" :info="averageData" :compHeight="7" :compWidth="15" /></div>
		<!-- <div><DonutChart v-for="i in 200" :usage="usage" :size="5"/></div> -->
		<pre>{{text}}</pre>
		<div>Total string data received: {{totalDataString.toLocaleString()}} bytes</div>
		<div>Total buffer data received: {{totalDataBuffer.toLocaleString()}} bytes</div>
	</div>
</template>

<script>
import { decode as msgPackDecode } from "@msgpack/msgpack"
import { decompress as decompressJson } from "compressed-json"
import { ungzip } from "pako"
import DonutChart from "./DonutChart.vue"
import HorizontalBar from './HorizontalBar.vue'
import LargeComputerOverview from './LargeComputerOverview.vue'
import SmallComputerOverview from "./SmallComputerOverview.vue"
import lib from "../lib/lib.js"


export default {
	data(){ 
		return{
			text:"",
			usage:0,
			totalDataString:0,
			totalDataBuffer:0,
			averageData:{},
		}
	},
	mounted(){
		
		// sets text to the JSON sting if obj is a string
		var messageHandler = (obj) => {
			if(obj.type == "info"){
				this.text = JSON.stringify(obj,null,2)
				this.usage = obj.average.cpu.average.usage * 4
				this.averageData = obj.average
			}
		}
		
		lib.messageHandlers.push(messageHandler)
	},
	components:{
		DonutChart,
		HorizontalBar,
		LargeComputerOverview,
		SmallComputerOverview
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

</style>