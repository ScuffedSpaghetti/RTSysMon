//@ts-check

module.exports = class ExtraDevice{
	type = ""
	constructor(extraDeviceOptions){
		if(!extraDeviceOptions.type){
			throw new Error("Invalid extra device config, missing type")
		}
		var type = extraDeviceOptions.type.replace(/\.+[\/\\]+/g,"").replace(/^[\/\\]+/g,"")
		var path = ((extraDeviceOptions.local) ? "../extra-local/" : "../extra/") + type
		this.device = new (require(path))(extraDeviceOptions)
		this.type = this.device.type || type
	}
	
	async getDeviceInfo(){
		var info = await this.device.getDeviceInfo()
		return info
	}
}