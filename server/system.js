//@ts-check





function recursiveRecordTotal(totalObj, obj){
	for(var x in obj){
		var val = obj[x]
		if(typeof val == "string"){
			totalObj[x] = totalObj[x] || {type:"string", strings:new Set()}
			totalObj[x].strings.add(val)
		}
		if(typeof val == "number"){
			totalObj[x] = totalObj[x] || {type:"number", numbers:[]}
			totalObj[x].numbers.push(val)
		}
		if(typeof val == "object"){
			totalObj[x] = totalObj[x] || {type:"object", object:{}}
			recursiveRecordTotal(totalObj[x].object, val)
		}
	}
}

function recursiveFinalTotal(totalRecordObj, total){
	for(var x in totalRecordObj){
		var val = totalRecordObj[x]
		if(val.type == "string"){
			total[x] = ""
			var separator = ""
			val.strings.forEach((str)=>{
				total[x] += separator + str
				separator = " | "
			})
		}
		if(val.type == "number"){
			var numbers = val.numbers.filter((num) => isFinite(num))
			if(numbers.length > 0){
				total[x] = 0
				for(var y in numbers){
					total[x] += numbers[y]
				}
				total[x] /= numbers.length
			}else{
				total[x] = val.numbers[0]
			}
		}
		if(val.type == "object"){
			total[x] = {}
			recursiveFinalTotal(val.object,total[x])
		}
	}
}

function averageObjects(arr){
	var totalRecordObj = {}
	for(var x in arr){
		recursiveRecordTotal(totalRecordObj, arr[x])
	}
	var total = {}
	//console.log(totalRecordObj)
	recursiveFinalTotal(totalRecordObj, total)
	return total
}










module.exports = class System{
	static activeSystems = []
	static clusterInfoCache = {}
	static clusterInfoCacheTime = 0
	
	static getClusterInfo(){
		var now = Date.now() / 1000
		if(now - System.clusterInfoCacheTime > 0.9){
			System.clusterInfoCacheTime = now
			var individual = []
			for(var x in System.activeSystems){
				individual.push(System.activeSystems[x].info)
			}
			var totalAverage = averageObjects(System.activeSystems)
			System.clusterInfoCache = {
				average: totalAverage,
				systems: individual
			}
		}
		return System.clusterInfoCache
	}
	
	
	
	
	
	
	info = undefined
	initialized = false
	constructor(socket,initMsg){
		this.socket = socket
		this.hostname = initMsg.hostname
		this.os = initMsg.os
	}
	sendJSON(obj){
		if(this.socket.readyState == this.socket.OPEN){
			this.socket.send(JSON.stringify(obj))
		}
	}
	async onMessage(obj){
		if(obj.type == "info"){
			this.info = obj.info
			if(!this.initialized){
				System.activeSystems.push(this)
				this.initialized = true
			}
		}
		
	}
	async remove(){
		for(var x in System.activeSystems){
			console.log(typeof x)
			if(System.activeSystems[x] == this){
				//@ts-ignore
				System.activeSystems.slice(x, x + 1)
			}
		}
	}
	getInfo(){
		return {
			hostname: this.hostname,
			os: this.os,
			info: this.info
		}
	}
}