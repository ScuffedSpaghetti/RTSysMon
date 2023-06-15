//@ts-check
let WebSocket = require("ws")
const msgPack = require("@msgpack/msgpack")
const compressJson = require("compressed-json")
const zlib = require("zlib")

if(!process.env["NODE_CONFIG_DIR"]){
	process.env["NODE_CONFIG_DIR"] = __dirname + "/config/"
}
//@ts-ignore
//require("module")._cache["js-yaml"] =  require("js-yaml")
let config = require("config")


let relayOptions = config.get("relays")
for(let x in relayOptions){
	launchRelay(relayOptions[x])
}

async function launchRelay(options){
	while(true){
		await /** @type {Promise<void>} */(new Promise((resolve)=>{
			let websocketFrom = new WebSocket(options.from)
			websocketFrom.binaryType = "nodebuffer"
			let websocketTo = new WebSocket(options.to)
			let intervalAlive = undefined
			let lastSeenFrom = Date.now() / 1000
			let lastSeenTo = Date.now() / 1000
			function close(){
				// console.error(new Error("closed"))
				if(intervalAlive){
					clearInterval(intervalAlive)
				}
				setTimeout(()=>{
					resolve()
				},1000)
				websocketFrom.close()
				websocketTo.close()
				if(process.env.VERBOSE){
					console.error("Socket disconnected at "+Date())
				}
			}
			websocketFrom.onerror = close
			websocketFrom.onclose = () => {
				console.log("from close")
				close()
			}
			websocketTo.onerror = close
			websocketTo.onclose = () => {
				console.log("to close")
				close()
			}
			websocketFrom.on("pong",()=>{
				lastSeenFrom = Date.now() / 1000
			})
			websocketTo.on("pong",()=>{
				lastSeenTo = Date.now() / 1000
			})
			intervalAlive = setInterval(async ()=>{
				let now = Date.now() / 1000
				if(now - lastSeenFrom > 200 || now - lastSeenTo > 200){
					console.log('socket ping timeout, reconnecting')
					close()
				}
			},10000)
			/**
			 * 
			 * @param {WebSocket} websocket 
			 * @param {*} obj 
			 */
			function sendJSON(websocket, obj){
				if(websocket.readyState == websocket.OPEN){
					websocket.send(JSON.stringify(obj))
				}
			}
			websocketFrom.onopen = async ()=>{
				sendJSON(websocketFrom, {
					type: "init_client",
				})
				//@ts-ignore
				websocketFrom._socket.setKeepAlive(true, 10000)
				//@ts-ignore
				websocketFrom._socket.setTimeout(30000)
				//@ts-ignore
				websocketFrom._socket.on('timeout', () => {
					if(process.env.VERBOSE){
						console.log('socket timeout, reconnecting')
					}
					close()
				})
			}
			websocketTo.onopen = async ()=>{
				sendJSON(websocketTo, {
					type: "init_relay",
					password: options.password,
				})
				//@ts-ignore
				websocketTo._socket.setKeepAlive(true, 10000)
				//@ts-ignore
				websocketTo._socket.setTimeout(30000)
				//@ts-ignore
				websocketTo._socket.on('timeout', () => {
					if(process.env.VERBOSE){
						console.log('socket timeout, reconnecting')
					}
					close()
				})
			}
			websocketFrom.onmessage = async (message) => {
				if(message.data instanceof Buffer){
					let buffer = message.data
					let data = compressJson.decompress(msgPack.decode(zlib.gunzipSync(buffer)))
					if(options.hostnamePattern){
						let pattern = RegExp(options.hostnamePattern)
						data = data.filter((item) => pattern.test(item.hostname))
					}
					// let outMessage = {
					// 	type: "info",
					// 	individual: data.individual
					// }
					sendJSON(websocketTo, data)
				}
			}
		}))
	}
}