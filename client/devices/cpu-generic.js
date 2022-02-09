//@ts-check
var os = require("os")

module.exports = class GenericCPU{
	oldCpusData = os.cpus()
	async getDeviceInfo(){
		var newCpusData = os.cpus()
		var devices = []
		for(var x in newCpusData){
			var newCpuData = newCpusData[x]
			var oldCpuData = this.oldCpusData[x]
			var deltas = {}
			for(var y in newCpuData.times){
				deltas[y] =  newCpuData.times[y] - oldCpuData.times[y]
			}
			var totalTime = 0
			for(var y in deltas){
				totalTime += deltas[y]
			}
			var usage = (totalTime - deltas.idle) / totalTime * 100
			if(isNaN(usage)){
				usage = 0
			}
			devices.push({
				usage: usage
			})
		}
		this.oldCpusData = newCpusData
		return devices
	}
}