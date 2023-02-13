// "\GPU Local Adapter Memory(*)\Local Usage"
// "\GPU Engine(*)\Utilization Percentage"
// "\GPU Engine(*)\Running Time"
// "\GPU Adapter Memory(*)\Shared Usage"
// "\GPU Adapter Memory(*)\Dedicated Usage"
// "\GPU Adapter Memory(*)\Total Committed"
// "\GPU Process Memory(*)\Shared Usage"
// "\GPU Process Memory(*)\GPU Process Memory"
// "\GPU Process Memory(*)\Non Local Usage"
// "\GPU Process Memory(*)\Local Usage"
// "\GPU Process Memory(*)\Total Committed"
// "\GPU Non Local Adapter Memory(*)\Non Local Usage"


//@ts-check

var child_process = require("child_process")
var fs = require("fs")
var path = require("path")
var csvParse = require("csv-parse/sync")


function getFirstTimeInfo(){
	return (new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			// dxdiag /dontskip /whql:on /t TempInfo.txt
			var prc = child_process.spawn("dxdiag", ["/dontskip", "/whql:on", "/t", "TempInfo.txt"])
			prc.on("error", reject)
			prc.stdout.on("end",async ()=>{
				resolve(await readFirstTimeInfo())
			})
		}catch(err){
			if(process.env.VERBOSE && !loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not read temp gpu file 'TempInfo.txt'.")
			}
			reject(err)
		}
	}))
}

function readFirstTimeInfo(){
	return (new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			var fileText = (await fs.promises.readFile(await fs.promises.realpath(path.resolve("TempInfo.txt")))).toString()
			var cardNameIndex = fileText.indexOf("Card name: ") + "Card name: ".length
			var dedicatedMemoryIndex = fileText.indexOf("Dedicated Memory: ", cardNameIndex) + "Dedicated Memory:".length
			var data = {}
			data.memory = {}
			data.name = fileText.substring(cardNameIndex, fileText.indexOf("\n", cardNameIndex))
			data.memory.bytes_total = parseInt(fileText.substring(dedicatedMemoryIndex, fileText.indexOf("MB", dedicatedMemoryIndex)))
			// console.log(`Card Name: ${gpuName}`)
			// console.log(`Dedicated Memory: ${dedicatedMemoryTotal} MB`)
			data.memory.bytes_total = data.memory.bytes_total * 1024 * 1024
			await removeFirstTimeInfo()
			resolve(data)
		}catch(err){
			if(process.env.VERBOSE && !loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not read temp gpu file 'TempInfo.txt'.")
			}
			reject(err)
		}
	}))
}

function removeFirstTimeInfo(){
	return /** @type {Promise<void>} */(new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			// console.log("Removing TempInfo.txt")
			await fs.promises.rm(await fs.promises.realpath(path.resolve("TempInfo.txt")))
			resolve()
		}catch(err){
			if(process.env.VERBOSE && !loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not get remove temp gpu file 'TempInfo.txt'.")
			}
			reject(err)
		}
	}))
}

function gpuData(){
	return new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			var prc = child_process.spawn("typeperf", ["-sc", "1", "\\GPU Adapter Memory(*)\\Dedicated Usage",  "\\GPU Engine(*)\\Utilization Percentage"])
			prc.on("error", reject)
			var out = ""
			prc.stdout.on("data",(data)=>{
				out += data
			})
			prc.stdout.on("end",()=>{
				try {
					if(!out){
						reject(new Error("No output"))
						return
					} else{
						out = out.replace("The command completed successfully.", "")
						out = out.replace("Exiting, please wait...", "")
						out = out.trim()
					}
					// console.log("Output: " + out)
					var data = csvParse.parse(out, {columns: true, skip_empty_lines: true})
					// console.log("Data: ", data)
					resolve(data[0])
				} catch (err) {
					reject(err)
				}
				
			})
		}catch(err){
			if(process.env.VERBOSE && !loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not get GPU information from typeperf.")
			}
			reject(err)
		}
	})
}

module.exports = class WindowsGPU{
	loggedError = false
	dedicatedMemoryTotal = 0
	gpuName = ""
	async init(){
		var tempData = await getFirstTimeInfo()
		this.dedicatedMemoryTotal = tempData.memory.bytes_total
		this.gpuName = tempData.name
	}
	data = []
	async getDeviceInfo(){
		this.getGPUs()
		return this.data
	}

	async getGPUs(){
		try{
			// var startTime = performance.now()
			var rawData = await gpuData()
			var devices = new Map()
			for(var x in rawData){
				var lastBackSlash = x.lastIndexOf('\\')
				var gpuID = x.substring((x.lastIndexOf('\\', (lastBackSlash - 1)) + 1), lastBackSlash)
				var name = gpuID.substring((gpuID.indexOf('(') + 1), gpuID.lastIndexOf(')'))
				if(devices.get(name) == undefined && name != ''){
					var device = {}
					device.name = name
					devices.set(name, device)
				}
				switch(x.substring((lastBackSlash + 1))){
					case "Dedicated Usage":
						devices.get(name).shared_usage = parseFloat(rawData[x])
					break
					case "Utilization Percentage":
						devices.get(name).utilization_percentage = parseFloat(rawData[x])
					break
				}		
			}
			// console.log(devices)
			var device = {}
			device.core = {}
			device.memory = {}
			device.name = this.gpuName
			var sharedUsage = 0
			var utilizationPercentage = 0.0
			for(var [key, value] of devices){
				if(value.shared_usage > 0){
					sharedUsage += value.shared_usage
				}
				if(value.utilization_percentage > 0){
					utilizationPercentage += value.utilization_percentage
				}
			}
			//usage
			device.core.usage = utilizationPercentage
			//vram
			device.memory.bytes = sharedUsage
			device.memory.bytes_total = this.dedicatedMemoryTotal
			device.memory.usage = device.memory.bytes / device.memory.bytes_total * 100
			
			// console.log(gpu)
			this.data = [device]
			// var endTime = performance.now()
			// console.log(`Process took ${endTime - startTime} milliseconds`)
		}catch(err){
			if(process.env.VERBOSE && !this.loggedError){
				this.loggedError = true
				console.error(err)
				console.error("No GPUs found on system")
			}
		}
	}
}