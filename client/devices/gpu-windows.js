//@ts-check

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




var child_process = require("child_process")
var fs = require("fs")
var path = require("path")
var csvParse = require("csv-parse/sync")
var TypePerf = require("./helpers/typeperf.js")

/*
Get-WmiObject Win32_PnPSignedDriver -Filter "DeviceClass = 'DISPLAY'"
Get-WmiObject Win32_PnPEntity -Filter "PNPClass = 'Displaya'"
// Get-WmiObject Win32_PnPEntity -Filter "PNPClass = 'Display'" | Get-PnpDeviceProperty | Export-Csv
Get-WmiObject Win32_PnPEntity -Filter "PNPClass = 'Display'" | foreach { [pscustomobject][ordered]@{Name = $_.Name; LUID = $_.GetDeviceProperties("{60b193cb-5276-4d0f-96fc-f173abad3ec6} 2").deviceProperties.data} } | Format-Table -AutoSize


 - get total memory
(Get-ItemProperty -Path "HKLM:\SYSTEM\ControlSet001\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0*" -Name "HardwareInformation.AdapterString", "HardwareInformation.qwMemorySize" -Exclude PSPath -ErrorAction SilentlyContinue) | foreach { [pscustomobject][ordered]@{Name = $_."HardwareInformation.AdapterString"; VRAM = $_."HardwareInformation.qwMemorySize"} } | ConvertTo-Csv

Get-WmiObject Win32_PnPEntity -Filter "PNPClass = 'Display'" | foreach { [pscustomobject][ordered]@{Name = $_.Name; LUID = [System.Convert]::ToString($_.GetDeviceProperties("{60b193cb-5276-4d0f-96fc-f173abad3ec6} 2").deviceProperties.data, 16)} } | ConvertTo-Csv
*/


function getCommandOutput(executable, arguments){
	return (new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			// dxdiag /dontskip /whql:on /t TempInfo.txt
			var prc = child_process.spawn(executable, arguments)
			prc.on("error", reject)
			var out = ""
			prc.stdout.on("data",(data)=>{
				out += data
			})
			prc.stdout.on("end",async ()=>{
				resolve(out)
			})
		}catch(err){
			reject(err)
		}
	}))
}


function getFirstTimeInfo(){
	return (new Promise(async (resolve,reject)=>{
		var loggedError = false
		try{
			// dxdiag /dontskip /whql:on /t TempInfo.txt
			var prc = child_process.spawn("dxdiag", ["/dontskip", "/whql:on", "/t", "TempInfo.txt"])
			prc.on("error", reject)
			prc.stdout.on("end",async ()=>{
				try{
					resolve(await readFirstTimeInfo())
				}catch(err){
					if(process.env.VERBOSE){
						console.error(err)
						console.error("Could not read temp gpu file 'TempInfo.txt'.")
					}
				}
			})
		}catch(err){
			if(process.env.VERBOSE){
				console.error(err)
				console.error("Could not run dxdiag.")
			}
			//reject(err)
		}
	}))
}

async function readFirstTimeInfo(){
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
	return data
}

async function removeFirstTimeInfo(){
	var loggedError = false
	try{
		// console.log("Removing TempInfo.txt")
		await fs.promises.rm(await fs.promises.realpath(path.resolve("TempInfo.txt")))
	}catch(err){
		if(process.env.VERBOSE){
			console.error(err)
			console.error("Could not get remove temp gpu file 'TempInfo.txt'.")
		}
	}
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
	luidToName = {}
	nameToVRAM = {}
	data = []
	hasInitialized = false
	async init(){
		// var tempData = await getFirstTimeInfo()
		// this.dedicatedMemoryTotal = tempData.memory.bytes_total
		// this.gpuName = tempData.name
		
	}
	async getDeviceInfo(){
		//this.getGPUs()
		if(!this.hasInitialized){
			this.hasInitialized = true
			this.getFirstInfo()
			this.typePerf = new TypePerf(async (data) => {
				this.parseGPUData(data)
			}, {
				restartTime: 15,
				performanceCounters: ["\\GPU Adapter Memory(*)\\Dedicated Usage",  "\\GPU Engine(*)\\Utilization Percentage"]
			})
		}
		return this.data
	}
	
	async getFirstInfo(){
		try{
			var nameULID = JSON.parse(await getCommandOutput("powershell", ["-command", 'ConvertTo-Json @(Get-WmiObject Win32_PnPEntity -Filter "PNPClass = \'Display\'" | foreach { [pscustomobject][ordered]@{name = $_.Name; luid = $_.GetDeviceProperties("{60b193cb-5276-4d0f-96fc-f173abad3ec6} 2").deviceProperties.data} })']))
			//console.log(nameULID)
			for(var x in nameULID){
				var x2 = nameULID[x]
				if(x2.name instanceof Array){
					// convert wide chars
					x2.name = Buffer.from(x2.name).toString("utf16le").replace("\x00", "")
				}
				this.luidToName[x2.luid] = x2.name
			}

			var nameVRAM = JSON.parse(await getCommandOutput("powershell", ["-command", 'ConvertTo-Json @(Get-ItemProperty -Path "HKLM:\\SYSTEM\\ControlSet001\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*" -Name "HardwareInformation.AdapterString", "HardwareInformation.qwMemorySize", "DriverDesc" -Exclude PSPath -ErrorAction SilentlyContinue | foreach { [pscustomobject][ordered]@{name = $_."HardwareInformation.AdapterString"; name2 = $_."DriverDesc"; vram = $_."HardwareInformation.qwMemorySize"} })']))
			//console.log(nameVRAM)
			for(var x in nameVRAM){
				var x2 = nameVRAM[x]
				if(x2.name instanceof Array){
					// convert wide chars
					x2.name = Buffer.from(x2.name).toString("utf16le").replace("\x00", "")
				}
				this.nameToVRAM[x2.name] = x2.vram || undefined
				this.nameToVRAM[x2.name2] = x2.vram || undefined
			}
		}catch(err){
			if(process.env.VERBOSE){
				console.error(err)
				console.error("Could not get GPU information from poweshell.")
			}
		}
		//console.log(this.luidToName, this.nameToVRAM)
	}
	
	
	/**
	 * 
	 * @param {{[key: string]:string}} data 
	 */
	async parseGPUData(data){
		//console.log("output", data)
		// array to contain order of luids
		var luids = []
		var lowestPID = Infinity
		/** @type {{[key: string]: {[key: number]: number}}} */
		var outDataTotals = {}
		/** @type {{[key: string]: {[key: number]: number}}} */
		var outDataCounts = {}
		/** @type {{[key: string]: {[key: number]: string}}} */
		var outDataTypes = {}
		
		/** @type {{[key: string]: number}} */
		var memoryUsage = {}
		
		for(var fullName in data){
			var value = parseFloat(data[fullName])
			var sectionSplit = fullName.split("\\")
			var partIndex = 0
			var parts = {}
			if(sectionSplit.length < 2){
				//console.log(sectionSplit,fullName)
				// ignore first value
				continue
			}
			var type = sectionSplit[sectionSplit.length-1]
			// parse data from the name
			var name = sectionSplit[sectionSplit.length-2].replace(/.*\(/, "").replace(/\)/, "")
			var nameSplit = name.split("_")
			//console.log(name)
			while(partIndex < nameSplit.length){
				let nameSection = nameSplit[partIndex]
				switch(nameSection){
					case "pid":
						partIndex++
						parts.pid = parseInt(nameSplit[partIndex])
						break
					case "luid":
						parts.luid = nameSplit[partIndex+1] + "_" + nameSplit[partIndex+2]
						partIndex += 2
						break
					case "eng":
						partIndex++
						parts.eng = parseInt(nameSplit[partIndex])
						break
					case "engtype":
						partIndex++
						parts.engtype = nameSplit[partIndex]
						break
				}
				partIndex++
			}
			if(type == "Utilization Percentage"){
				if(!parts.luid || isNaN(parts.eng)){
					// ignore things with missing parts
					console.log(fullName)
					continue
				}
				// find order of luids on the system process with the lowest pid
				if(parts.pid < lowestPID){
					lowestPID = parts.pid
					luids = []
				}
				if(parts.pid == lowestPID){
					if(!luids.includes(parts.luid)){
						luids.push(parts.luid)
					}
				}
				// add to totals
				if(!outDataTotals[parts.luid]){
					outDataTotals[parts.luid] = {}
					outDataCounts[parts.luid] = {}
					outDataTypes[parts.luid] = {}
				}
				var engId = parts.eng
				if(!outDataTotals[parts.luid][engId]){
					outDataTotals[parts.luid][engId] = 0
					outDataCounts[parts.luid][engId] = 0
					outDataTypes[parts.luid][engId] = parts.engtype
				}
				outDataTotals[parts.luid][engId] += value
				outDataCounts[parts.luid][engId] += 1
			}
			if(type == "Dedicated Usage"){
				if(!parts.luid){
					// ignore things with missing parts
					continue
				}
				memoryUsage[parts.luid] = value
			}
			
			//console.log(parts, value)
			//console.log(fullName, data[fullName])
		}
		//console.log(outDataTotals)
		//console.log(memoryUsage)
		//console.log(outDataTypes)
		//console.log(outDataCounts)
		
		this.data = []
		
		// reorder based on gpu id
		var id = 0
		for(var x in luids){
			let luid = luids[x]
			let outDataAdapter = outDataTotals[luid]
			let maxUsagePercent = 0
			let maxUsageCount = 0
			for(var y in outDataAdapter){
				maxUsagePercent = Math.max(maxUsagePercent, outDataAdapter[y])
				maxUsageCount = Math.max(maxUsageCount, outDataCounts[luid][y])
			}
			var memoryBytes = memoryUsage[luid]
			if(maxUsageCount <= 1){
				// there is some dummy adapter only seen in the system process
				//continue
			}
			var device = {}
			var luidNumeric = parseInt(luid.replace(/0x|_/g, ""), 16)
			//console.log(luid, luidNumeric, luid.replace(/0x|_/g, ""))
			device.name = this.luidToName[luidNumeric]
			if(!device.name){
				continue
				device.name = luid
			}
			device.core = {usage: maxUsagePercent}
			device.memory = {
				bytes: memoryBytes,
				bytes_total: this.nameToVRAM[device.name]
			}
			if(device.memory.bytes_total){
				device.memory.usage = device.memory.bytes / device.memory.bytes_total * 100
			}
			// console.log(device.name, outDataAdapter)
			this.data.push(device)
			id++
		}
	}

	async getGPUs(){
		return
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