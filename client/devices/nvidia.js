//@ts-check

var child_process = require("child_process")
var fs = require("fs")
var xmlParse = require("fast-xml-parser")


//nvidia-smi -q -d UTILIZATION,TEMPERATURE,POWER,MEMORY,CLOCK

function gpuData(){
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
	var spl = val.split(" ")
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


function standardGpuData(gpu){
	var out = {}
	
	out.core = {}
	out.core.usage = parseFloat(gpu?.utilization?.gpu_util)
	
	out.name = gpu?.product_name
	
	out.memory = {}
	//out.memory.usage = parseFloat(gpu?.utilization?.memory_util)
	out.memory.bytes = parseUnit(gpu?.fb_memory_usage?.used)
	out.memory.bytes_total = parseUnit(gpu?.fb_memory_usage?.total)
	out.memory.usage = out.memory.bytes / out.memory.bytes_total * 100
	
	out.power = {}
	out.power.watts = parseFloat(gpu?.power_readings?.power_draw)
	out.power.watts_limit = parseFloat(gpu?.power_readings?.power_limit)
	out.power.usage = out.power.watts / out.power.watts_limit * 100
	
	out.bus = {}
	out.bus.type = "pcie"
	out.bus.tx_bytes = parseUnit(gpu?.pci?.tx_util)
	out.bus.rx_bytes = parseUnit(gpu?.pci?.rx_util)
	out.bus.generation = parseInt(gpu?.pci?.pci_gpu_link_info?.pcie_gen?.max_link_gen)
	out.bus.width = parseInt(gpu.pci?.pci_gpu_link_info?.link_widths?.max_link_width)
	
	out.fan_speed = parseFloat(gpu?.fan_speed)
	
	out.temperature = parseFloat(gpu?.temperature?.gpu_temp)
	
	return out
}

module.exports = class NvidiaGPU{
	async getDeviceInfo(){
		try{
			var rawData = await gpuData()
			var devices = []
			for(var x in rawData.gpu){
				devices.push(standardGpuData(rawData.gpu[x]))
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