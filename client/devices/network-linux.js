//@ts-check
var fs = require("fs")
var path = require("path")


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

module.exports = class LinuxNetwork{
	loggedError = false
	lastData = {}
	async getDeviceInfo(){
		var devices = []
		try{
			// https://www.kernel.org/doc/Documentation/ABI/testing/sysfs-class-net
			var devDir = "/sys/class/net/"
			var interfaceNamesAll = await fs.promises.readdir(devDir)
			var interfaceNames = []
			var newLastData = {}
			for(var x in interfaceNamesAll){
				var name = interfaceNamesAll[x]
				var fullPath = await fs.promises.realpath(path.join(devDir,name))
				var physical = fullPath.indexOf("virtual") == -1
				if(physical){
					interfaceNames.push(name)
					var device = {
						name: name,
						//physical: physical
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
								device.rx_usage = device.rx_bytes / speed
							}
						}
						if(this.lastData[name].tx_bytes != undefined && tx_bytes != undefined){
							device.tx_bytes = (tx_bytes - this.lastData[name].tx_bytes) / deltaTime
							if(speed){
								device.tx_bytes_limit = speed
								device.tx_usage = device.tx_bytes / speed
							}
						}
					}
					devices.push(device)
				}
			}
			this.lastData = newLastData
			//console.log(interfaceNames)
		}catch(err){
			console.error(err)
		}
		return devices
	}
}