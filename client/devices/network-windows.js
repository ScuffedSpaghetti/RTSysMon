//@ts-check

var child_process = require("child_process")
var fs = require("fs")
var csvParse = require("csv-parse/sync")

//typeperf -sc 1 "\Network Interface(*)\Current Bandwidth" "\Network Interface(*)\Bytes Sent/sec" "\Network Interface(*)\Bytes Received/sec"

function networkData(){
	return new Promise(async (resolve,reject)=>{
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
			} catch (error) {
				reject(new Error("Oops, Something Went Wrong!"))
			}
			
		})
	})
}

module.exports = class WindowsNetwork{
	async getDeviceInfo(){
		try{
			var rawData = await networkData()
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
				var nic = {}
				nic.name = value.name
				nic.rx_bytes_limit = value.rx_bytes_limit
				nic.tx_bytes_limit = value.tx_bytes_limit
				nic.rx_bytes = value.rx_bytes
				nic.tx_bytes = value.tx_bytes
				nic.rx_usage = nic.rx_bytes > 0 ? ((nic.rx_bytes / nic.rx_bytes_limit) * 100) : 0.0
				nic.tx_usage = nic.tx_bytes > 0 ? ((nic.tx_bytes / nic.tx_bytes_limit) * 100) : 0.0
				NICs.push(nic)
			}
			// console.log(NICs)
			return NICs
		}catch(err){
			if(process.env.VERBOSE){
				console.error(err)
				console.error("No NICs found on system")
			}
			return []
		}
	}
}