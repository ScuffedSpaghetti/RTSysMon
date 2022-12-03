//@ts-check
var fs = require("fs")
var path = require("path")
var gpuIDTable = require("./data/gpu-ids")

//linux drm
//current power draw in watts if divided by 1,000,000: hwmon/hwmon(0-9)/power1_average
//current max power draw in watts if divided by 1,000,000: hwmon/hwmon(0-9)/power1_cap
//fan max speed: hwmon/hwmon(0-9)/fan1_max
//fan target speed: hwmon/hwmon(0-9)/fan1_target
//current temp in deg C if divided by 1,000: hwmon/hwmon(0-9)/temp1_input
//gpu utilization percent: gpu_busy_percent
//vram used: mem_info_vram_used
//vram total: mem_info_vram_total
//	use link speed and width to determine pcie gen. ex: if speed = 16.0GT/s and width = 16 the pcie 3.0 16x used
//current pcie link speed: current_link_speed
//current pcie link width: current_link_width
//max pcie link speed: max_link_speed
//max pcie link width: max_link_width
//	should work and return something like 'AMD Radeon HD 7800' but doesn't work with current installed amd pu drivers
//product name: product_name
//device id: device (can be used with an array to find the card name ex. 0x73ff)
//driver: uevent (could use instead of name if one can't bb found ex. amdgpu)

var pcieGenLookup = {
	"2.5": 1,
	"5.0": 2,
	"8.0": 3,
	"16.0": 4,
	"32.0": 5,
	"64.0": 6,
	"128.0": 7
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

async function tryRead(filePath){
	try{
		return (await fs.promises.readFile(filePath)).toString()
	}catch(e){
		return undefined
	}
}
async function tryReadInt(filePath){
	var value = await tryRead(filePath)
	if(value){
		return parseInt(value)
	}else{
		return undefined
	}
}

async function tryReadDir(filePath){
	try{
		return (await fs.promises.readdir(filePath))
	}catch(e){
		return []
	}
}

module.exports = class LinuxGPU{
	loggedError = false
	lastData = {}
	
	
	async getDeviceInfo(){
		var devices = []
		try{
			var devDir = "/sys/class/drm/"
			var gpuNamesAll = await fs.promises.readdir(devDir)
			for(var x in gpuNamesAll){
				var name = gpuNamesAll[x]
				if(!/card\d$/.test(name)){
					continue
				}
				// console.log("Name: " + name)
				var fullPath = await fs.promises.realpath(path.join(devDir,name,'device'))
				var enabled = await tryReadInt(path.join(fullPath,"enable"))
				// console.log(name + " enabled: " + enabled)
				if(enabled == 1){
					var deviceID = await tryRead(path.join(fullPath,"device"))
					var deviceName = undefined
					if(deviceID){
						deviceName = gpuIDTable["0x" + deviceID.substring(2).toUpperCase().trim()]?.["Graphics card"]
					}
					
					var driverPath = await fs.promises.realpath(path.join(fullPath,'driver'))
					var driverName = driverPath.substring(driverPath.lastIndexOf("/") + 1)
					if(deviceName){
						name = deviceName
					} else if(driverName) {
						name = driverName
					}

					var device = {}
	
					device.core = {}
					device.core.usage = await tryReadInt(path.join(fullPath,"gpu_busy_percent"))
					if(!isFinite(device.core.usage)){
						delete device.core
					}
					
					device.name = name
					
					device.memory = {}
					device.memory.bytes = parseUnit(await tryReadInt(path.join(fullPath,"mem_info_vram_used")))
					device.memory.bytes_total = parseUnit(await tryReadInt(path.join(fullPath,"mem_info_vram_total")))
					device.memory.usage = device.memory.bytes / device.memory.bytes_total * 100
					if(!isFinite(device.memory.bytes)){
						delete device.memory
					}
					
					var hwmonDir = (await tryReadDir(path.join(fullPath, "hwmon")))[0]
					if(hwmonDir){
						device.power = {}
						var powerUsed = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "power1_average"))
						if(powerUsed != undefined){
							device.power.watts = (powerUsed / 1000000)
						}
						var powerTotal = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "power1_cap"))
						if(powerTotal){
							device.power.watts_limit = (powerTotal / 1000000)
						}
						device.power.usage = device.power.watts / device.power.watts_limit * 100
						if(!isFinite(device.power.watts)){
							delete device.power
						}

						var fanMax = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "fan1_max"))
						var fanTarget = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "fan1_target"))
						if(fanTarget && fanMax){
							device.fan_speed = fanTarget / fanMax * 100
						}
						
						var gpuTemp = await tryReadInt(path.join(fullPath,"hwmon",hwmonDir, "temp1_input"))
						if(gpuTemp){
							device.temperature = gpuTemp / 1000
						}
					}
					
					device.bus = {}
					device.bus.type = "pcie"
					// tx is likely GPU->CPU and rx is likely CPU->GPU
					// device.bus.tx_bytes = parseUnit(gpu["pcie.tx_util"])
					// device.bus.rx_bytes = parseUnit(gpu["pcie.rx_util"])
					var pcieSpeedCurrent = await tryRead(path.join(fullPath,"current_link_speed"))
					device.bus.width = await tryReadInt(path.join(fullPath,"current_link_width"))
					var pcieSpeedMax = await tryRead(path.join(fullPath,"max_link_speed"))
					device.bus.width_max = await tryReadInt(path.join(fullPath,"max_link_width"))
					if(pcieSpeedCurrent && device.bus.width){
						device.bus.generation = pcieGenLookup[pcieSpeedCurrent?.split(' ')[0]]
					}
					if(pcieSpeedMax && device.bus.width_max){
						device.bus.generation_max = pcieGenLookup[pcieSpeedMax?.split(' ')[0]]
					}
					
					if(!device.bus.generation){
						delete device.bus
					}
					
					devices.push(device)
				}
			}
		}catch(err){
			if(process.env.VERBOSE && !this.loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not get GPU info from /sys/class/drm.")
			}
		}
		return devices
	}
}