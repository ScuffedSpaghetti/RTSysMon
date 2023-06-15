//@ts-check

var System = require("./system")


module.exports = class SystemRelay{
	/** @type {Map<string,System>} */
	relayedSystems = new Map()
	info = {}
	initialized = false
	constructor(socket,initMsg){
		this.socket = socket
	}
	sendJSON(obj){
		if(this.socket.readyState == this.socket.OPEN){
			this.socket.send(JSON.stringify(obj))
		}
	}
	async onMessage(obj){
		if(obj.type == "info"){
			/** @type {Map<string,System>} */
			let relayedSystemsNew = new Map()
			for(let x in obj.individual){
				let relayedSystem = obj.individual[x]
				// @ts-ignore
				let system = this.relayedSystems.get(relayedSystem.uid)
				if(system){
					this.relayedSystems.delete(relayedSystem.uid)
				}else{
					system = new System(undefined, {
						hostname: relayedSystem.hostname
					})
				}
				await system.onMessage({
					type: "info",
					info: relayedSystem
				})
				relayedSystemsNew.set(relayedSystem.uid, system)
			}
			// remove systems that are no longer in the relayed message
			for(let [id, system] of this.relayedSystems){
				system.remove()
			}
			this.relayedSystems = relayedSystemsNew
		}
		
	}
	async remove(){
		for(let [id, system] of this.relayedSystems){
			system.remove()
		}
		this.relayedSystems.clear()
	}
}