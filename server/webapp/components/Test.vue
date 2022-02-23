<template>
	<div>
		<div>
			<DonutChart :usage="usage" :size="20"/>
			<HorizontalBar :usage="usage" :width="20" :height="20" />
		</div>
		<br>
		<div><LargeComputerOverview :info="averageData"/></div>
		<br>
		<div class="container"><SmallComputerOverview v-for="i in 10" :info="averageData"/></div>
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
		var websocket = new WebSocket(((location.protocol.indexOf("s") > -1)?"wss://":"ws://")+location.host+location.pathname)
		websocket.binaryType = "arraybuffer";
		
		// sets text to the JSON sting if obj is a string
		var messageHandler = (obj) => {
			if(obj.type == "info"){
				this.text = JSON.stringify(obj,null,2)
				this.usage = obj.average.cpu.average.usage * 4
				this.averageData = obj.average
			}
		}
		
		
		// the new function syntax preserves 'this' and should be used in vue elements for anonymous functions
		// deals with decompressing the JSON if it is compressed
		websocket.onmessage = (event) => {
			if(typeof event.data == "string"){
				this.totalDataString += event.data.length
				var obj = JSON.parse(event.data)
				messageHandler(obj)
			}else{
				//console.log(event.data)
				this.totalDataBuffer += event.data.byteLength
				var binary = ungzip(event.data)
				var obj = msgPackDecode(binary)
				obj = decompressJson(obj)
				messageHandler(obj)
			}
			
		}
		
		
		
		var initMessage = {
			type: "init_client"
		}
		
		// with the old function syntax 'this' is overwritten and can not be accessed
		websocket.onopen = function(){
			websocket.send(JSON.stringify(initMessage))
		}
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