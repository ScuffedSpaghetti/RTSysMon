//@ts-check
var os = require("os")
var fs = require("fs")



async function getOSName(){
	var osName = os.version ? os.version() : undefined
	try{
		var contents = await fs.promises.readFile("/etc/os-release")
		var lines = contents.toString().trim().split("\n")
		var data = Object.create(null)
		for(var x in lines){
			var line = lines[x]
			var equalLocation = line.indexOf("=")
			var key = line.substring(0, equalLocation).toLowerCase()
			var value = line.substring(equalLocation + 1)
			if(value[0] == '"' || value[0] == "'"){
				value = value.substring(1, value.length - 1)
			}
			data[key] = value
		}
		osName = data.pretty_name || (data.name + " " + data.version) || osName
	}catch(e){}
	return osName
}

module.exports = class GenericSystem{
	async getDeviceInfo(){
		return [{
			os: await getOSName(),
			uptime: os.uptime()
		}]
	}
}