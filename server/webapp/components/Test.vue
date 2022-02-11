<template>
	<pre>{{text}}</pre>
</template>

<script>
export default {
	data(){ 
		return{
			text:""
		}
	},
	mounted(){
		var websocket = new WebSocket(((location.protocol.indexOf("s") > -1)?"wss://":"ws://")+location.host+location.pathname)
		websocket.onmessage = (event) => {
			var obj = JSON.parse(event.data)
			this.text = JSON.stringify(obj,null,2)
		}
		var initMessage = {
			type: "init_client"
		}
		websocket.onopen = function(){
			websocket.send(JSON.stringify(initMessage))
		}
	}
}
</script>

<style>

</style>