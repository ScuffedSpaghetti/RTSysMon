//@ts-check

module.exports = class ExtraDevice{
	type = ""
	constructor(extraDeviceOptions){
		var type = extraDeviceOptions.type.replace(/[\/\\]+/g,"")
		var path = ((extraDeviceOptions.local) ? "../extra-local/" : "../extra/") + type
		this.device = new (require(path))(extraDeviceOptions)
		this.type = type
	}
	
	async getDeviceInfo(){
		var info = await this.device.getDeviceInfo()
		return info
	}
}