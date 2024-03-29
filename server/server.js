//@ts-check

var WebSocket = require("ws")
var http = require("http")
var path = require("path")

if(!process.env["NODE_CONFIG_DIR"]){
	process.env["NODE_CONFIG_DIR"] = __dirname + "/config/"
}
var config = require("config")

var System = require("./system")
var SystemRelay = require("./system-relay")
var Listener = require("./listener")
var lightHttp = require("./lighthttp")


var httpServer = http.createServer()

var wsServer = new WebSocket.Server({
	server:httpServer
})

var webServer = lightHttp()
webServer.add_server(httpServer)
webServer.web_directory = path.join(__dirname, "webapp/dist")

httpServer.listen(config.get("port"))

var password = config.get("password")

wsServer.on("connection",(socket,req)=>{
	req.socket.setKeepAlive(true, 10000)
	req.socket.setTimeout(30000)
	/**@type {System | Listener | SystemRelay | undefined} */
	var endpoint = undefined
	req.socket.on('timeout', () => {
		console.log('socket timeout')
		close()
	})
	socket.on("message",function(msg,isBinary){
		if(isBinary){
			return
		}
		var obj = undefined
		try{
			obj = JSON.parse(msg.toString())
		}catch(err){
			return
		}
		if(endpoint){
			endpoint.onMessage(obj)
		}else{
			switch(obj.type){
				case "init_system":
					if(password && password !== obj.password){
						close()
					}
					endpoint = new System(socket, obj)
				break
				
				case "init_client":
				case "init_listener":
					endpoint = new Listener(socket, obj)
				break
				
				case "init_relay":
					endpoint = new SystemRelay(socket, obj)
				break
				
				default:
					close()
			}
		}
		
		//console.log(obj)
	})
	function close(){
		if(endpoint){
			endpoint.remove()
			endpoint = undefined
		}
		socket.close()
	}
	socket.on("close", close)
	socket.on("error", close)
})