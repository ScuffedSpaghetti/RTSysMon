//@ts-check
var os = require("os")
var WebSocket = require("ws")

var NvidiaGPU = require("./devices/nvidia")
var GenericCPU = require("./devices/cpu-generic")
var GenericRAM = require("./devices/memory-generic")


function recursiveRecordTotal(totalObj, obj){
	for(var x in obj){
		var val = obj[x]
		if(typeof val == "string"){
			totalObj[x] = totalObj[x] || {type:"string", strings:new Set()}
			totalObj[x].strings.add(val)
		}
		if(typeof val == "number"){
			totalObj[x] = totalObj[x] || {type:"number", numbers:[]}
			totalObj[x].numbers.push(val)
		}
		if(typeof val == "object"){
			if(val instanceof Array){
				totalObj[x] = totalObj[x] || {type:"array", object:[]}
			}else{
				totalObj[x] = totalObj[x] || {type:"object", object:{}}
			}
			recursiveRecordTotal(totalObj[x].object, val)
		}
	}
}

function recursiveFinalTotal(totalRecordObj, total, settings){
	for(var x in totalRecordObj){
		var val = totalRecordObj[x]
		if(val.type == "string"){
			total[x] = ""
			var separator = ""
			val.strings.forEach((str)=>{
				total[x] += separator + str
				separator = " | "
			})
		}
		if(val.type == "number"){
			var numbers = val.numbers.filter((num) => isFinite(num))
			if(numbers.length > 0){
				total[x] = 0
				for(var y in numbers){
					total[x] += numbers[y]
				}
				if(!settings.addKeys || !settings.addKeys.includes(x)){
					total[x] /= numbers.length
				}
			}else{
				total[x] = val.numbers[0]
			}
			if(settings.maxPrecision > -1){
				var mult = Math.pow(10,settings.maxPrecision)
				total[x] = Math.round(total[x] * mult) / mult
			}
		}
		if(val.type == "object"){
			total[x] = {}
			recursiveFinalTotal(val.object,total[x], settings)
		}
		if(val.type == "array"){
			total[x] = []
			recursiveFinalTotal(val.object,total[x], settings)
		}
	}
}

function averageObjects(arr,settings){
	settings = settings || {}
	
	var totalRecordObj = {}
	for(var x in arr){
		recursiveRecordTotal(totalRecordObj, arr[x])
	}
	var total = {}
	//console.log(totalRecordObj)
	recursiveFinalTotal(totalRecordObj, total, settings)
	return total
}





async function getValidDevices(){
	var devices = {}
	
	var cpu = new GenericCPU()
	devices.cpu = cpu
	
	var memory = new GenericRAM()
	devices.memory = memory
	
	var nvidia = new NvidiaGPU()
	if((await nvidia.getDeviceInfo()).length > 0){
		devices.gpu = nvidia
	}
	
	return devices
}

async function queryDevices(devices,options){
	options = options || {}
	
	var info = {}
	for(var x in devices){
		var devInfoAll = await devices[x].getDeviceInfo()
		var devInfo = {}
		devInfo.average = averageObjects(devInfoAll,{
			addKeys:["bytes","bytes_total", "watts","watts_limit"]
		})
		if(options.individual !== false){
			devInfo.individual = devInfoAll
		}
		if(x == "cpu"){
			devInfo.individual=undefined
			devInfo.individualUsage = devInfoAll.map((a) => a.usage)
		} 
		info[x] = devInfo
	}
	return info
}





void (async function(){
	var devices = await getValidDevices()
	
	var outHTML = document.createElement("pre")
	document.body.appendChild(outHTML)
	setInterval(async ()=>{
		//console.log((await cpu.getDeviceInfo())[0])
		//console.log(await queryDevices(devices))
		//console.log(JSON.stringify(await queryDevices(devices,{individual:false}),null,2))
		outHTML.innerText = JSON.stringify(await queryDevices(devices,{individual:false}),null,2)
	},1000/4)
	
})


void (async function(){
	var devices = await getValidDevices()
	while(true){
		await new Promise((resolve)=>{
			var websocket = new WebSocket("ws://127.0.0.1:3498")
			var interval = undefined
			function close(){
				if(interval){
					clearInterval(interval)
				}
				setTimeout(()=>{
					resolve()
				},1000)
				websocket.close()
			}
			websocket.onerror = close
			websocket.onclose = close
			function sendJSON(obj){
				if(websocket.readyState == websocket.OPEN){
					websocket.send(JSON.stringify(obj))
				}
			}
			websocket.onopen = async ()=>{
				sendJSON({
					type:"init_system",
					hostname:os.hostname(),
					os:os.version()
				})
				interval = setInterval(async ()=>{
					var info = await queryDevices(devices)
					sendJSON({
						type:"info",
						info:info
					})
				//introduce some randomness to interval times so that nodes send at different times
				},1000 - Math.random() * 100)
				//@ts-ignore
				websocket._socket.setKeepAlive(true, 10000)
			}
		})
	}
})()