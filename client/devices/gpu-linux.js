//@ts-check
var fs = require("fs")
var path = require("path")

//linux drm
//current power draw in watts if divided by 1,000,000: hwmon/hwmon2/power1_average
//current max power draw in watts if divided by 1,000,000: hwmon/hwmon2/power1_cap
//fan max speed: hwmon/hwmon2/fan1_max
//fan target speed: hwmon/hwmon2/fan1_target
//current temp in deg C if divided by 1,000: hwmon/hwmon2/temp1_input
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

module.exports = class LinuxGPU{
	loggedError = false
	lastData = {}
	
	
	async getDeviceInfo(){
		var devices = []
		try{
			var devDir = "/sys/class/drm/"
			var gpuNamesAll = await fs.promises.readdir(devDir)
			var gpuNames = []
			var newLastData = {}
			for(var x in gpuNamesAll){
				var name = gpuNamesAll[x]
				if(!/card\d$/.test(name)){
					continue
				}
				var fullPath = await fs.promises.realpath(path.join(devDir,name,'device'))
				var enabled = await tryRead(path.join(fullPath,"enable"))
				if(enabled?.match('1')){
					var productName = await tryRead(path.join(fullPath,"product_name"))
					if(productName == null || productName == ''){

					}
					gpuNames.push(name)
					var device = {
						name: name,
					}
					newLastData[name] = {}
					
					var rx_bytes = await tryReadInt(path.join(fullPath,"statistics/rx_bytes"))
					newLastData[name].rx_bytes = rx_bytes
					
					var tx_bytes = await tryReadInt(path.join(fullPath,"statistics/tx_bytes"))
					newLastData[name].tx_bytes = tx_bytes
					
					var speed = await tryReadInt(path.join(fullPath,"speed"))
					if(speed){
						speed *= 1000000/8
					}
					
					newLastData[name].time = Date.now()/1000
					if(this.lastData[name]){
						var deltaTime = newLastData[name].time -  this.lastData[name].time
						if(this.lastData[name].rx_bytes != undefined && rx_bytes != undefined){
							device.rx_bytes = (rx_bytes - this.lastData[name].rx_bytes) / deltaTime
							if(speed){
								device.rx_bytes_limit = speed
								device.rx_usage = device.rx_bytes / speed * 100
							}
						}
						if(this.lastData[name].tx_bytes != undefined && tx_bytes != undefined){
							device.tx_bytes = (tx_bytes - this.lastData[name].tx_bytes) / deltaTime
							if(speed){
								device.tx_bytes_limit = speed
								device.tx_usage = device.tx_bytes / speed * 100
							}
						}
					}
					devices.push(device)
				}
			}
			this.lastData = newLastData
			//console.log(interfaceNames)
		}catch(err){
			if(process.env.VERBOSE && !this.loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not get network information from /sys.")
			}
		}
		return devices
	}
}