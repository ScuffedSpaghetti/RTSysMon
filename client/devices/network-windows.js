//@ts-check

var child_process = require("child_process")
var fs = require("fs")
var csvParse = require("csv-parse/sync")
var TypePerf = require("./helpers/typeperf.js")

//typeperf -sc 1 "\Network Interface(*)\Current Bandwidth" "\Network Interface(*)\Bytes Sent/sec" "\Network Interface(*)\Bytes Received/sec"

function networkData(){
	return new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			var prc = child_process.spawn("typeperf", ["-sc", "1", "\\Network Interface(*)\\Current Bandwidth", "\\Network Interface(*)\\Bytes Sent/sec", "\\Network Interface(*)\\Bytes Received/sec"])
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
					//console.log("Data: ", data)
					resolve(data[0])
				} catch (err) {
					reject(err)
				}
				
			})
		}catch(err){
			if(process.env.VERBOSE && !loggedError){
				this.loggedError = true
				console.error(err)
				console.error("Could not get network information from typeperf.")
			}
			reject(err)
		}
	})
}

module.exports = class WindowsNetwork{
	loggedError = false
	data = []
	hasInitialized = false
	async getDeviceInfo(){
		//this.getNICs()
		
		if(!this.hasInitialized){
			this.hasInitialized = true
			this.typePerf = new TypePerf(async (data) => {
				this.parseNICs(data)
			}, {
				restartTime: 60,
				performanceCounters: ["\\Network Interface(*)\\Current Bandwidth", "\\Network Interface(*)\\Bytes Sent/sec", "\\Network Interface(*)\\Bytes Received/sec"]
			})
		}
		return this.data
	}

	async parseNICs(rawData){
		try{
			// var rawData = await networkData()
			var devices = new Map()
			var NICs = []
			for(var x in rawData){
				var lastBackSlash = x.lastIndexOf('\\')
				var networkInterface = x.substring((x.lastIndexOf('\\', (lastBackSlash - 1)) + 1), lastBackSlash)
				var name = networkInterface.substring((networkInterface.indexOf('(') + 1), networkInterface.lastIndexOf(')'))
				if(devices.get(name) == undefined && name != ''){
					var device = {}
					device.name = name
					devices.set(name, device)
				}
				switch(x.substring((lastBackSlash + 1))){
					case "Current Bandwidth":
						devices.get(name).rx_bytes_limit = parseFloat(rawData[x]) / 8
						devices.get(name).tx_bytes_limit = parseFloat(rawData[x]) / 8
					break
					case "Bytes Sent/sec":
						devices.get(name).tx_bytes = parseFloat(rawData[x])
					break
					case "Bytes Received/sec":
						devices.get(name).rx_bytes = parseFloat(rawData[x])
					break
				}		
			}
			//console.log(devices)
			for(var [key, value] of devices){
				if(value.rx_bytes_limit > 0){
					var nic = {}
					nic.name = value.name
					nic.rx_bytes_limit = value.rx_bytes_limit
					nic.tx_bytes_limit = value.tx_bytes_limit
					nic.rx_bytes = value.rx_bytes
					nic.tx_bytes = value.tx_bytes
					nic.rx_usage = (nic.rx_bytes / nic.rx_bytes_limit) * 100
					nic.tx_usage = (nic.tx_bytes / nic.tx_bytes_limit) * 100
					NICs.push(nic)
				}
			}
			// console.log(NICs)
			this.data = NICs
		}catch(err){
			if(process.env.VERBOSE && !this.loggedError){
				this.loggedError = true
				console.error(err)
				console.error("No NICs found on system")
			}
		}
	}
}