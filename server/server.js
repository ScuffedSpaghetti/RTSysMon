//@ts-check

var WebSocket = require("ws")
var http = require("http")
var System = require("./system")
var Listener = require("./listener")
var lightHttp = require("./lighthttp")


var httpServer = http.createServer()

var wsServer = new WebSocket.Server({
	server:httpServer
})

var webServer = lightHttp()
webServer.add_server(httpServer)

httpServer.listen(3498)



wsServer.on("connection",(socket,req)=>{
	req.socket.setKeepAlive(true, 10000)
	var endpoint = undefined
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
					endpoint = new System(socket, obj)
				break
				
				case "init_client":
					endpoint = new Listener(socket, obj)
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