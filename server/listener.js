const System = require("./system")
const msgPack = require("@msgpack/msgpack")
const compressJson = require("compressed-json")

module.exports = class Listener{
	
	
	constructor(socket,initMsg){
		this.socket = socket
		this.interval = setInterval(()=>{
			this.sendInfo()
		}, 1000)
	}
	
	sendInfo(){
		var info = System.getClusterInfo()
		info.type = "info"
		this.sendJSON(info)
	}
	
	sendJSON(obj){
		if(this.socket.readyState == this.socket.OPEN){
			this.socket.send(JSON.stringify(obj,function(key, value) {
				if (typeof value === 'number') {
					var multiple = 1000
					return Math.round(value * multiple) / multiple
				}else{
					return value
				}
			}))
			
			var type = obj.type
			var obj = compressJson.compress(obj)
			obj.type = type
			this.socket.send(msgPack.encode(obj, {
				forceFloat32: true
			}))
		}
	}
	
	remove(){
		clearInterval(this.interval)
	}
}