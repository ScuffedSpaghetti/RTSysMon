//@ts-check
var child_process = require("child_process")
var csvParse = require("csv-parse/sync")
const { clearInterval } = require("timers")

module.exports = class TypePerf{
	constructor(dataCallback, options){
		options = options || {}
		options.restartTime = options.restartTime || 60
		options.performanceCounters = options.performanceCounters || []
		this.options = options
		/** @type {function} */
		this.dataCallback = dataCallback
		this.relaunchInterval = setInterval(() => {
			this.launchProcess()
		}, options.restartTime * 1000)
		this.launchProcess(true)
	}
	launchProcess(firstTime){
		try{
			if(this.oldPrc && this.oldPrc.exitCode == null){
				this.oldPrc.kill()
			}
			this.oldPrc = this.prc
			// typeperf -sc 2 "\GPU Adapter Memory(*)\Dedicated Usage"  "\GPU Engine(*)\Utilization Percentage"
			var prc = child_process.spawn("typeperf", this.options.performanceCounters)
			this.prc = prc
			//var prc = child_process.spawn("typeperf", ["\\Network Interface(*)\\Bytes Sent/sec"])
			prc.on("error", (err)=>{
				if(process.env.VERBOSE){
					console.error(err)
					console.error("Could not get GPU information from typeperf.")
				}
			})
			var header = ""
			var partialData = ""
			prc.stdout.on("data",async (data)=>{
				try{
					// console.log("data",data.toString())
					data = partialData + data.toString().replace(/\r/g, "")
					data = data.split("\n")
					// console.log("data",data)
					partialData = data.pop()
					if(data.length == 0){
						return
					}
					if(!header.length){
						header = data.shift()
					}
					if(data.length == 0){
						return
					}
					if(!header.length){
						header = data.shift()
					}
					for(var x in data){
						// TODO: this is one second behind because the \n is placed by the next line
						var dataWithHeader = header + "\n" + data[x] + "\n"
						// console.log("dataWithHeader",dataWithHeader)
						// console.log("header",header)
						// console.log("data",data)
						// console.log("partialData",partialData)
						var parsed = csvParse.parse(dataWithHeader, {columns: true, skip_empty_lines: true})[0]
						
						// kill old process once new one starts emitting data
						if(this.oldPrc && this.oldPrc.exitCode == null){
							setTimeout(() => {
								if(this.oldPrc && this.oldPrc.exitCode == null){
									this.oldPrc.kill()
									this.oldPrc = null
									// console.log("kill")
								}
							}, 2000)
						}
						// console.log("out")
						await this.dataCallback(parsed)
					}
				}catch(e){
					console.log(e)
				}
			})
			prc.stdout.on("end",()=>{
				
			})
			return prc
		}catch(err){
			if(process.env.VERBOSE){
				console.error(err)
				console.error("Could not get GPU information from typeperf.")
			}
			if(firstTime){
				clearInterval(this.relaunchInterval)
			}
		}
	}
}