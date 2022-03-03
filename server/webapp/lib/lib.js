
import { decode as msgPackDecode } from "@msgpack/msgpack"
import { decompress as decompressJson } from "compressed-json"
import { ungzip } from "pako"


var messageHandlers = []

var websocket = new WebSocket(((location.protocol.indexOf("s") > -1)?"wss://":"ws://")+location.host+location.pathname)
websocket.binaryType = "arraybuffer";

// sets text to the JSON sting if obj is a string
var messageHandler = (obj) => {
    if(obj.type == "info"){
       
    }
    for(var x in messageHandlers){
        messageHandlers[x](obj)
    }
}

// the new function syntax preserves 'this' and should be used in vue elements for anonymous functions
// deals with decompressing the JSON if it is compressed
websocket.onmessage = (event) => {
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
}

export default {
	messageHandlers: messageHandlers
}