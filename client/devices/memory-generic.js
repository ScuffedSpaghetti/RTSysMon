//@ts-check
var os = require("os")


module.exports = class GenericRAM{
	oldCpusData = os.cpus()
	async getDeviceInfo(){
		
		var mem = {}
		mem.bytes_total = os.totalmem()
		mem.bytes = mem.bytes_total - os.freemem()
		mem.usage = mem.bytes / mem.bytes_total * 100
		
		var devices = [mem]
		return devices
	}
}