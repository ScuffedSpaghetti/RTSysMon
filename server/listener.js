//@ts-check
const System = require("./system")
const msgPack = require("@msgpack/msgpack")
const compressJson = require("./compressed-json")
const zlib = require("zlib")
const config = require("config")

module.exports = class Listener{
	
	
	constructor(socket,initMsg){
		this.socket = socket
		this.interval = setInterval(()=>{
			this.sendInfo()
		}, 1000)
		setTimeout(()=>{
			this.sendSettings()
		}, 500)
		this.sendSettings()
		this.sendInfo()
	}
	
	sendInfo(){
		// var info = System.getClusterInfo()
		// info.type = "info"
		// this.sendJSON(info)
		if(this.socket.readyState == this.socket.OPEN){
			this.socket.send(System.getClusterInfo(true))
		}
	}
	
	sendSettings(){
		this.sendJSON({
			settings:{
				show_about: config.get("webShowAbout"),
				default_theme: config.get("webDefaultTheme"),
				disable_animation: config.get("webDisableAnimation"),
			},
			type: "settings"
		})
	}
	
	sendJSON(obj){
		if(this.socket.readyState == this.socket.OPEN){
			// this.socket.send(JSON.stringify(obj,function(key, value) {
			// 	if (typeof value === 'number') {
			// 		var multiple = 1000
			// 		return Math.round(value * multiple) / multiple
			// 	}else{
			// 		return value
			// 	}
			// }))
			
			
			// var type = obj.type
			obj = compressJson.compress(obj, {preserveOrder: true})
			// obj.type = type
			// this.socket.send(JSON.stringify(obj))
			// return
			var binary = msgPack.encode(obj, {
				forceFloat32: true,
				ignoreUndefined: true
			})
			//may cause memory fragmentation if async
			//more testing would be necessary to determine if gzip shows the same behavior as deflate
			binary = zlib.gzipSync(binary)
			this.socket.send(binary)
		}
	}
	async onMessage(obj){
		
	}
	
	remove(){
		clearInterval(this.interval)
	}
}