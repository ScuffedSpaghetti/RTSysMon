//@ts-check
var os = require("os")
var WebSocket = require("ws")
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/"
//@ts-ignore
//require("module")._cache["js-yaml"] =  require("js-yaml")
var config = require("config")

var NvidiaGPU = require("./devices/nvidia")
var GenericCPU = require("./devices/cpu-generic")
var LinuxCPU = require("./devices/cpu-linux")
var GenericRAM = require("./devices/memory-generic")
var LinuxRAM = require("./devices/memory-linux")
var LinuxNetwork = require("./devices/network-linux")
var WindowsNetwork = require("./devices/network-windows")
var ExtraDevice = require("./devices/extra-device")



function recursiveRecordTotal(totalObj, obj){
	for(var x in obj){
		var val = obj[x]
		if((totalObj[x] == undefined || totalObj[x].type == "string") && typeof val == "string"){
			totalObj[x] = totalObj[x] || {type:"string", strings:new Set()}
			totalObj[x].strings.add(val)
		}
		if((totalObj[x] == undefined || totalObj[x].type == "number") && typeof val == "number"){
			totalObj[x] = totalObj[x] || {type:"number", numbers:[]}
			totalObj[x].numbers.push(val)
		}
		if((totalObj[x] == undefined || totalObj[x].type == "object" ||  totalObj[x].type == "array") && typeof val == "object"){
			if(val instanceof Array){
				totalObj[x] = totalObj[x] || {type:"array", object:[]}
			}else{
				totalObj[x] = totalObj[x] || {type:"object", object:Object.create(null)}
			}
			recursiveRecordTotal(totalObj[x].object, val)
		}
	}
}

function recursiveFinalTotal(totalRecordObj, total, settings){
	for(var x in totalRecordObj){
		var val = totalRecordObj[x]
		if(settings.ignoreKeys && settings.ignoreKeys.includes(x)){
			continue
		}
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
			total[x] = Object.create(null)
			recursiveFinalTotal(val.object,total[x], settings)
		}
		if(val.type == "array"){
			if(settings.ignoreSingleArrayKeys && settings.ignoreSingleArrayKeys.includes(x) && val.length <= 1){
				continue
			}
			total[x] = []
			recursiveFinalTotal(val.object,total[x], settings)
		}
	}
}

function averageObjects(arr,settings){
	settings = settings || {}
	
	var totalRecordObj = Object.create(null)
	for(var x in arr){
		recursiveRecordTotal(totalRecordObj, arr[x])
	}
	var total = Object.create(null)
	//console.log(totalRecordObj)
	recursiveFinalTotal(totalRecordObj, total, settings)
	return total
}





async function getValidDevices(){
	var devices = {}
	if(!config.get("hideDefaultDevices")){
		switch(process.platform){
			case "linux":
				devices.cpu = new LinuxCPU()
				devices.memory = new LinuxRAM()
				devices.network = new LinuxNetwork(config.get("showVirtualNetworkInterfaces"))
			break
			case "win32":
				devices.cpu = new GenericCPU()
				devices.memory = new GenericRAM()
				devices.network = new WindowsNetwork()
			break
			default:
				devices.cpu = new GenericCPU()
				devices.memory = new GenericRAM()
		}
	}
	
	var nvidia = new NvidiaGPU()
	if((await nvidia.getDeviceInfo()).length > 0){
		devices.gpu = nvidia
	}
	
	var extraDevices = config.get("extraDevices").filter((extraDevice) => {return extraDevice.type != "example"})
	
	if(extraDevices.length > 0){
		devices.extra = []
		for(var x in extraDevices){
			var extraDeviceOptions = extraDevices[x]
			try{
				devices.extra.push(new ExtraDevice(extraDeviceOptions))
			}catch(err){
				console.error(err)
				console.error("Failed to load custom device " + extraDeviceOptions.type)
			}
		}
	}
	
	return devices
}

async function queryDevices(devices,options){
	options = options || {}
	
	async function queryDevice(device, info, existingDevInfo){
		var individuals = undefined
		try{
			individuals = await device.getDeviceInfo()
		}catch(err){
			console.error(err)
			console.error("A device reader threw an error! This is a sign that something was programed wrong or there is a system failure.\n" +
				"This message should never appear during normal operation.")
		}
		if(individuals && individuals.length > 0){
			var devInfoAll = existingDevInfo || []
			devInfoAll = devInfoAll.concat(individuals)
			var devInfo = {}
			devInfo.average = averageObjects(devInfoAll,{
				addKeys:["bytes","bytes_total", "watts","watts_limit","rx_bytes","rx_bytes_limit","tx_bytes","tx_bytes_limit"],
				ignoreSingleArrayKeys:["individual"],
			})
			for(var x in individuals){
				var individual = individuals[x]
				if(individual?.power?.watts != undefined){
					info.power = info.power || {average:{watts:0}}
					info.power.average.watts += individual.power.watts
				}
			}
			if(options.individual !== false /*&& devInfoAll.length > 1*/){
				devInfo.individual = devInfoAll
			}
			return devInfo
		}
	}
	
	var info = {}
	for(var x in devices){
		if(x == "extra"){
			continue
		}
		var devInfo = await queryDevice(devices[x], info)
		if(devInfo){
			if(x == "cpu"){
				devInfo.individualUsage = devInfo.individual.map((a) => a.usage)
				devInfo.individual=undefined
			}
			info[x] = devInfo
		}
	}
	if(devices.extra){
		info.extra = {}
		// query extra devices and merge any that have the same type
		for(var x in devices.extra){
			var extraDevice = devices.extra[x]
			var devInfo = await queryDevice(extraDevice, info, info.extra[extraDevice.type]?.individual)
			if(devInfo){
				info.extra[extraDevice.type] = devInfo
			}
		}
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

var webSocketAddress = (config.get("serverSecure")?"wss":"ws")+"://"+config.get("serverAddress")
var password = config.get("password")

if(config.get("verbose")){
	process.env.VERBOSE = "true"
}

console.log("connecting to " + webSocketAddress)
void (async function(){
	var devices = await getValidDevices()
	while(true){
		await /** @type {Promise<void>} */(new Promise((resolve)=>{
			var websocket = new WebSocket(webSocketAddress)
			var interval = undefined
			var intervalAlive = undefined
			var lastSeen = Date.now() / 1000
			function close(){
				if(interval){
					clearInterval(interval)
				}
				if(intervalAlive){
					clearInterval(intervalAlive)
				}
				setTimeout(()=>{
					resolve()
				},1000)
				websocket.close()
				if(process.env.VERBOSE){
					console.error("Socket disconnected at "+Date())
				}
			}
			websocket.onerror = close
			websocket.onclose = close
			function sendJSON(obj){
				if(websocket.readyState == websocket.OPEN){
					websocket.send(JSON.stringify(obj))
				}
			}
			websocket.on("pong",()=>{
				lastSeen = Date.now() / 1000
			})
			intervalAlive = setInterval(async ()=>{
				var now = Date.now() / 1000
				if(now - lastSeen > 200){
					console.log('socket ping timeout, reconnecting')
					close()
				}
			},10000)
			websocket.onopen = async ()=>{
				sendJSON({
					type:"init_system",
					hostname:config.get("customName") || os.hostname(),
					os:os.version?os.version():undefined,
					password:password,
				})
				interval = setInterval(async ()=>{
					var info = await queryDevices(devices)
					//console.log(info)
					sendJSON({
						type:"info",
						info:info
					})
					websocket.ping()
				//introduce some randomness to interval times so that nodes send at different times
				},1000 - Math.random() * 100)
				//@ts-ignore
				websocket._socket.setKeepAlive(true, 10000)
				//@ts-ignore
				websocket._socket.setTimeout(30000)
				//@ts-ignore
				websocket._socket.on('timeout', () => {
					if(process.env.VERBOSE){
						console.log('socket timeout, reconnecting')
					}
					close()
				})
			}
			
		}))
	}
})()