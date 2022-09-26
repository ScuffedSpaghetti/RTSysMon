//@ts-check

var child_process = require("child_process")
var fs = require("fs")
var xmlParse = require("fast-xml-parser")
var csvParse = require("csv-parse/sync")


//nvidia-smi -q -d UTILIZATION,TEMPERATURE,POWER,MEMORY,CLOCK

function gpuDataAll(){
	return new Promise(async (resolve,reject)=>{
		var prc = child_process.spawn("nvidia-smi", ["-x", "-q"])
		prc.on("error", reject)
		var out = ""
		prc.stdout.on("data",(data)=>{
			out += data
		})
		prc.stdout.on("end",()=>{
			var parser = new xmlParse.XMLParser()
			//out = fs.readFileSync("testxml.xml").toString()
			if(!out){
				reject(new Error("No output"))
				return
			}
			var data = parser.parse(out)
			data = data?.nvidia_smi_log
			if(data && !(data.gpu instanceof Array)){
				data.gpu = [data.gpu]
			}
			resolve(data)
			// console.log(data)
			// console.log(standardGpuData(data.gpu[0]))
		})
	})
}


function parseUnit(val){
	if(typeof val == "number"){
		return val
	}
	
	if(typeof val != "string"){
		return NaN
	}
	var spl = val.split(/[ \/]/g)
	var numericalValue = parseFloat(spl[0])
	var unit = spl[1]
	if(unit.indexOf("KB") == 0){
		numericalValue *= 1000
	}
	if(unit.indexOf("MB") == 0){
		numericalValue *= 1000000
	}
	if(unit.indexOf("GB") == 0){
		numericalValue *= 10000000000
	}
	if(unit.indexOf("KiB") == 0){
		numericalValue *= 1024
	}
	if(unit.indexOf("MiB") == 0){
		numericalValue *= 1024*1024
	}
	if(unit.indexOf("GiB") == 0){
		numericalValue *= 1024*1024*1024
	}
	return numericalValue
}


function standardGpuDataFromAll(gpu){
	var out = {}
	
	out.core = {}
	out.core.usage = parseFloat(gpu?.utilization?.gpu_util)
	
	out.name = gpu?.product_name
	
	out.memory = {}
	//out.memory.usage = parseFloat(gpu?.utilization?.memory_util)
	out.memory.bytes = parseUnit(gpu?.fb_memory_usage?.used)
	out.memory.bytes_total = parseUnit(gpu?.fb_memory_usage?.total)
	out.memory.usage = out.memory.bytes / out.memory.bytes_total * 100
	if(!isFinite(out.memory.bytes)){
		delete out.memory
	}
	
	out.power = {}
	out.power.watts = parseFloat(gpu?.power_readings?.power_draw)
	out.power.watts_limit = parseFloat(gpu?.power_readings?.power_limit)
	out.power.usage = out.power.watts / out.power.watts_limit * 100
	if(!isFinite(out.power.watts)){
		delete out.power
	}
	
	out.bus = {}
	out.bus.type = "pcie"
	out.bus.tx_bytes = parseUnit(gpu?.pci?.tx_util)
	out.bus.rx_bytes = parseUnit(gpu?.pci?.rx_util)
	out.bus.generation_max = parseInt(gpu?.pci?.pci_gpu_link_info?.pcie_gen?.max_link_gen)
	out.bus.width = parseInt(gpu.pci?.pci_gpu_link_info?.link_widths?.max_link_width)
	out.bus.generation = parseInt(gpu?.pci?.pci_gpu_link_info?.pcie_gen?.current_link_gen) || out.bus.generation_max
	out.bus.width_max = parseInt(gpu.pci?.pci_gpu_link_info?.link_widths?.current_link_width) || out.bus.width_max
	
	out.fan_speed = parseFloat(gpu?.fan_speed)
	
	out.temperature = parseFloat(gpu?.temperature?.gpu_temp)
	
	return out
}

var queries=[
	"gpu_name",
	"utilization.gpu",
	"power.draw",
	"power.limit",
	"memory.used",
	"memory.total",
	"temperature.gpu",
	"fan.speed",
	"pcie.link.gen.max",
	"pcie.link.gen.current",
	"pcie.link.width.max",
	"pcie.link.gen.current",
]
queries = queries.filter((value) => !!value)
var query = "--query-gpu="+queries.join(",")
//console.log("nvidia-smi --format=csv " + query)
function gpuData(){
	return new Promise(async (resolve,reject)=>{
		
		var prc = child_process.spawn("nvidia-smi", ["--format=csv", query])
		prc.on("error", reject)
		var out = ""
		prc.stdout.on("data",(data)=>{
			out += data
		})
		prc.stdout.on("end",()=>{
			if(!out){
				reject(new Error("No output"))
				return
			}
			//console.log(out)
			try{
				var dataRaw = csvParse.parse(out)
				var header = dataRaw.shift()
				for(var x in header){
					header[x] = header[x].trim().split(" ")[0]
				}
				var data = []
				for(var x in dataRaw){
					var item = dataRaw[x]
					var itemData = {}
					for(var y in item){
						itemData[header[y]] = item[y]?.trim()
					}
					data.push(itemData)
				}
				resolve(data)
			}catch(err){
				reject(err)
			}
			// console.log(standardGpuData(data.gpu[0]))
		})
	})
}

// adds bus usage to data
function gpuBusData(existingData){
	return new Promise(async (resolve,reject)=>{
		existingData = existingData || []
		var prc = child_process.spawn("nvidia-smi", ["dmon", "-s", "t", "-c", "1"])
		prc.on("error", reject)
		var out = ""
		prc.stdout.on("data",(data)=>{
			out += data
		})
		prc.stdout.on("end",()=>{
			if(!out){
				resolve(existingData)
				return
			}
			//console.log(out)
			try{
				var dataRaw = out.split("\n")
				var header = dataRaw.shift()?.replace("#","")?.trim()?.split(/\W+/g).map(value => value.toLowerCase()) || []
				var units = dataRaw.shift()?.replace(/#|\/s/g,"")?.trim()?.split(/\W+/g) || []
				//console.log(header,units)
				var data = []
				for(var x in dataRaw){
					var existingItem = existingData[x]
					if(existingItem){
						var item = dataRaw[x].trim()?.split(/\W+/g)
						var itemData = {}
						for(var y in item){
							var outName = undefined
							if(header[y] == "rxpci"){
								outName = "pcie.rx_util"
							}
							if(header[y] == "txpci"){
								outName = "pcie.tx_util"
							}
							if(outName){
								existingItem[outName] = item[y] + " " + units[y]
							}
							itemData[header[y]] = item[y]
						}
					}
				}
				resolve(data)
			}catch(err){
				resolve(existingData)
			}
			// console.log(standardGpuData(data.gpu[0]))
		})
	})
}

function standardGpuData(gpu){
	//console.log(gpu)
	var out = {}
	
	out.core = {}
	out.core.usage = parseFloat(gpu["utilization.gpu"])
	
	out.name = gpu["name"]
	
	out.memory = {}
	//out.memory.usage = parseFloat(gpu?.utilization?.memory_util)
	out.memory.bytes = parseUnit(gpu["memory.used"])
	out.memory.bytes_total = parseUnit(gpu["memory.total"])
	out.memory.usage = out.memory.bytes / out.memory.bytes_total * 100
	if(!isFinite(out.memory.bytes)){
		delete out.memory
	}
	
	out.power = {}
	out.power.watts = parseFloat(gpu["power.draw"])
	out.power.watts_limit = parseFloat(gpu["power.limit"])
	out.power.usage = out.power.watts / out.power.watts_limit * 100
	if(!isFinite(out.power.watts)){
		delete out.power
	}
	
	out.bus = {}
	out.bus.type = "pcie"
	// tx is likely GPU->CPU and rx is likely CPU->GPU
	out.bus.tx_bytes = parseUnit(gpu["pcie.tx_util"])
	out.bus.rx_bytes = parseUnit(gpu["pcie.rx_util"])
	out.bus.generation_max = parseInt(gpu["pcie.link.gen.max"])
	out.bus.width_max = parseInt(gpu["pcie.link.width.max"])
	out.bus.generation = parseInt(gpu["pcie.link.gen.current"]) || out.bus.generation_max
	out.bus.width = parseInt(gpu["pcie.link.width.current"]) || out.bus.width_max
	
	if(!out.bus.generation && out.bus.tx_bytes == undefined){
		delete out.bus
	}
	
	out.fan_speed = parseFloat(gpu["fan.speed"])
	
	out.temperature = parseFloat(gpu["temperature.gpu"])
	
	return out
}

module.exports = class NvidiaGPU{
	async getDeviceInfo(){
		try{
			var devices = []
			// var rawData = await gpuDataAll()
			// for(var x in rawData.gpu){
			// 	devices.push(standardGpuDataFromAll(rawData.gpu[x]))
			// }
			var rawData = await gpuData()
			await gpuBusData(rawData)
			for(var x in rawData){
				devices.push(standardGpuData(rawData[x]))
			}
			return devices
		}catch(err){
			if(process.env.VERBOSE){
				console.error(err)
				console.error("Nvidia GPU not found. Check if nvidia-smi is in the path.")
			}
			return []
		}
	}
}