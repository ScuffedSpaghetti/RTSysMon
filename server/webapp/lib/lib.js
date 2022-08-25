
import { decode as msgPackDecode } from "@msgpack/msgpack"
import { decompress as decompressJson } from "compressed-json"
import { ungzip } from "pako"


var messageHandlers = []
var websocket = undefined

function createConnection(){
    websocket = new WebSocket(((location.protocol.indexOf("s") > -1)?"wss://":"ws://")+location.host+location.pathname)
    websocket.binaryType = "arraybuffer";

    var totalBytes = 0
    var lastMessageLength = 0

    // sets text to the JSON sting if obj is a string
    var messageHandler = (obj) => {
        if(obj.type == "info"){
            obj.bytes = lastMessageLength
            obj.totalBytes = totalBytes
        }
        for(var x in messageHandlers){
            messageHandlers[x](obj)
        }
    }

    // the new function syntax preserves 'this' and should be used in vue elements for anonymous functions
    // deals with decompressing the JSON if it is compressed
    websocket.onmessage = (event) => {
        var length = event.data.length || event.data.byteLength
        lastMessageLength = length
        totalBytes += length
        if(typeof event.data == "string"){
            var obj = JSON.parse(event.data)
            messageHandler(obj)
        }else{
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
        messageHandler({
            type: "status",
            connected: true,
        })
    }
    websocket.onclose = function(){
        messageHandler({
            type: "status",
            connected: false,
        })
        websocket = undefined
    }
    websocket.onerror = function(){
        messageHandler({
            type: "status",
            connected: false,
        })
        websocket = undefined
    }
    messageHandler({
        type: "status",
        connected: true,
    })
}

function connect(){
    if(!websocket){
        createConnection()
    }
}
function disconnect(){
    if(websocket){
        websocket.close()
        websocket = undefined
    }
}

export default {
	messageHandlers: messageHandlers,
    connect: connect,
    disconnect: disconnect,
}