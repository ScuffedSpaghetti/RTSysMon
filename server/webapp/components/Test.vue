<template>
	<div>
		<pre>{{text}}</pre>
		<div>Total string data received: {{totalDataString.toLocaleString()}} bytes</div>
		<div>Total buffer data received: {{totalDataBuffer.toLocaleString()}} bytes</div>
	</div>
</template>

<script>
import { decode as msgPackDecode } from "@msgpack/msgpack"
import { decompress as decompressJson } from "compressed-json"


export default {
	data(){ 
		return{
			text:"",
			totalDataString:0,
			totalDataBuffer:0,
		}
	},
	mounted(){
		var websocket = new WebSocket(((location.protocol.indexOf("s") > -1)?"wss://":"ws://")+location.host+location.pathname)
		websocket.binaryType = "arraybuffer";
		
		var messageHandler = (obj) => {
			this.text = JSON.stringify(obj,null,2)
		}
		
		
		// the new function syntax resevers this and should be used in vue elements for anonymous functions
		websocket.onmessage = (event) => {
			if(typeof event.data == "string"){
				this.totalDataString += event.data.length
				var obj = JSON.parse(event.data)
				messageHandler(obj)
			}else{
				console.log(event.data)
				this.totalDataBuffer += event.data.byteLength
				var obj = msgPackDecode(event.data)
				obj = decompressJson(obj)
				messageHandler(obj)
			}
			
		}
		
		
		
		var initMessage = {
			type: "init_client"
		}
		
		// with the old function syntax this is overitten and can not be accessed
		websocket.onopen = function(){
			websocket.send(JSON.stringify(initMessage))
		}
	}
}
</script>

<style>

</style>