//@ts-check
var os = require("os")
var fs = require("fs")
var GenericRAM = require("./memory-generic")


module.exports = class LinuxRAM extends GenericRAM{
	useMeminfo = undefined
	async getDeviceInfo(){
		if(this.useMeminfo == undefined)
		try{
			var data = (await fs.promises.readFile("/proc/meminfo")).toString()
			this.useMeminfo = data.toLowerCase().indexOf("memavailable") != -1
		}catch(err){
			this.useMeminfo = false
			if(process.env.VERBOSE){
				console.error(err)
				console.error("Could not access /proc/meminfo to get accurate memory readings.")
			}
		}
		
		
		
		if(this.useMeminfo){
			var data = (await fs.promises.readFile("/proc/meminfo")).toString()
			var values = {}
			var lines = data.split("\n")
			for(var x in lines){
				var line = lines[x].split(/[\: \t]+/g).map((value) => value.toLowerCase())
				var multiplier = 1024
				switch(line[2]){
					case "gb":
						multiplier = 1024 * 1024 * 1024
						break
					case "mb":
						multiplier = 1024 * 1024
						break
					case "kb":
						multiplier = 1024
						break
					case "b":
						multiplier = 1
						break
				}
				values[line[0]] = parseFloat(line[1]) * multiplier
			}
			
			var mem = {}
			mem.bytes_total = values.memtotal
			mem.bytes = mem.bytes_total - (values.memavailable || values.memfree)
			mem.usage = mem.bytes / mem.bytes_total * 100
			
			if(!isFinite(mem.usage)){
				this.useMeminfo = false
				console.error("/proc/meminfo did not get accurate memory readings.")
			}
			
			var devices = [mem]
			return devices
		}else{
			return super.getDeviceInfo()
		}
		
	}
}