
//@ts-check
var GenericCPU = require("./cpu-generic")
var child_process = require("child_process")

function powerData(){
	return new Promise(async (resolve,reject)=>{
		// in debian turbostat can be found in the linux-cpupower package
		// in ubuntu it is in linux-tools-generic
		// turbostat --quiet --show PkgWatt,CorWatt,Core,CPU --num_iterations 1 --interval 0.01
		var prc = child_process.spawn("turbostat", ["--quiet", "--show", "PkgWatt,CorWatt,Core,CPU", "--num_iterations", "1", "--interval", "0.01"])
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
			try{
				var data = {}
				
				var lines = out.replaceAll("\r","").trim().split("\n")
				var index = undefined
				var rawData = []
				for(var x in lines){
					var lineStr = lines[x].trim()
					var line = lineStr.split(/[ \t]+/g)
					//console.log(line)
					if(line[0] == ""){
						line.splice(0,1)
					}
					if(line.length == 0){
						continue
					}
					if(!index){
						index = line.slice(0)
						for(var y in index){
							index[y] = index[y].toLowerCase()
						}
						continue
					}
					var proc = {}
					for(let x in line){
						//@ts-ignore
						proc[index[x]] = line[x]
					}
					rawData.push(proc)
				}
				for(var x in rawData){
					var core = rawData[x]
					if(core.cpu == "-" || core.core == "-"){
						continue
					}
					if(core.pkgwatt >= 0){
						data.packageWattage = (data.packageWattage || 0) + parseFloat(core.pkgwatt)
					}
					if(core.corwatt >= 0){
						data.coreWattage = (data.coreWattage || 0) + parseFloat(core.corwatt)
					}
				}
				
				console.log(data.packageWattage, data.coreWattage)
				if(data.packageWattage != undefined || data.coreWattage != undefined){
					data.power = data.packageWattage || data.coreWattage
				}
				
				resolve(data)
			}catch(err){
				reject(err)
			}
		
			// console.log(data)
			// console.log(standardGpuData(data.gpu[0]))
		})
	})
}


module.exports = class LinuxCPU extends GenericCPU{
	turboStatSuccess = undefined
	
	
	
	async getDeviceInfo(){
		var devices = await super.getDeviceInfo()
		
		var extraData = {}
		if(this.turboStatSuccess !== false){
			try{
				var rawData = await powerData()
				extraData.watts = rawData.power / devices.length
				
				if(this.turboStatSuccess == undefined){
					this.turboStatSuccess = rawData.power != undefined
				}
			}catch(err){
				if(this.turboStatSuccess == undefined){
					this.turboStatSuccess = false
				}
				if(process.env.VERBOSE){
					console.error(err)
					console.error("Could not get cpu power. Root privileges are needed to access msr and turbostat must be installed")
				}
			}
		}
		
		for(var x in devices){
			var device = devices[x]
			for(var y in extraData){
				device[y] = extraData[y]
			}
		}
		return devices
	}
}