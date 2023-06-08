//@ts-check


const msgPack = require("@msgpack/msgpack")
const compressJson = require("compressed-json")
const zlib = require("zlib")



function recursiveRecordTotal(totalObj, obj){
	for(var x in obj){
		if(x.endsWith("_ignore") || obj[x+"_ignore"]){
			// ignore if ends with ignore or if the same key with the addition of _ignore exists
			return
		}
		var val = obj[x]
		if((totalObj[x] == undefined || totalObj[x].type == "string") && typeof val == "string"){
			totalObj[x] = totalObj[x] || {type:"string", strings:new Set()}
			totalObj[x].strings.add(val)
		}
		if((totalObj[x] == undefined || totalObj[x].type == "number") && typeof val == "number"){
			totalObj[x] = totalObj[x] || {type:"number", numbers:[]}
			if(obj[x + "_reduce_overwrite"]){
				totalObj[x].numbers = []
			}
			totalObj[x].numbers.push(val)
		}
		if((totalObj[x] == undefined || totalObj[x].type == "object" ||  totalObj[x].type == "array") && typeof val == "object"){
			if(val instanceof Array){
				totalObj[x] = totalObj[x] || {type:"array", object:[]}
			}else{
				totalObj[x] = totalObj[x] || {type:"object", object:Object.create(null)}
			}
			recursiveRecordTotal(totalObj[x].object, val)
		}
	}
}

function recursiveFinalTotal(totalRecordObj, total, settings){
	for(var x in totalRecordObj){
		var val = totalRecordObj[x]
		if(settings.ignoreKeys && settings.ignoreKeys.includes(x)){
			continue
		}
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
				var method = "ave"
				if(totalRecordObj[x+"_reduce_min"]){
					method = "min"
				}
				if(totalRecordObj[x+"_reduce_max"]){
					method = "max"
				}
				if(totalRecordObj[x+"_reduce_add"]){
					method = "add"
				}
				if(totalRecordObj[x+"_reduce_overwrite"]){
					method = "over"
				}
				
				
				switch(method){
					case "min":
						var outMin = numbers[0]
						for(var y in numbers){
							outMin = Math.min(outMin, numbers[y])
						}
						total[x] = outMin
						break
					case "max":
						var outMax = numbers[0]
						for(var y in numbers){
							outMax = Math.max(outMax, numbers[y])
						}
						total[x] = outMax
						break
					case "over":
						total[x] = numbers[0]
						break
					case "ave":
					case "add":
					default:
						var outTotal = 0
						for(var y in numbers){
							outTotal += numbers[y]
						}
						if(!(settings.addKeys && settings.addKeys.includes(x) || method == "add")){
							outTotal /= numbers.length
						}
						total[x] = outTotal
				}
			}else{
				total[x] = val.numbers[0]
			}
			if(settings.maxPrecision > -1){
				var mult = Math.pow(10,settings.maxPrecision)
				total[x] = Math.round(total[x] * mult) / mult
			}
		}
		if(val.type == "object"){
			total[x] = Object.create(null)
			recursiveFinalTotal(val.object,total[x], settings)
		}
		if(val.type == "array"){
			if(settings.ignoreSingleArrayKeys && settings.ignoreSingleArrayKeys.includes(x) && val.length <= 1){
				continue
			}
			total[x] = []
			recursiveFinalTotal(val.object,total[x], settings)
		}
	}
}

function averageObjects(arr,settings){
	settings = settings || {}
	
	var totalRecordObj = Object.create(null)
	for(var x in arr){
		recursiveRecordTotal(totalRecordObj, arr[x])
	}
	var total = Object.create(null)
	//console.log(totalRecordObj)
	recursiveFinalTotal(totalRecordObj, total, settings)
	return total
}




function alphanumSort(a, b) {
	function chunkify(t) {
	  var tz = new Array();
	  var x = 0, y = -1, n = 0, i, j;
  
	  while (i = (j = t.charAt(x++)).charCodeAt(0)) {
		var m = (i == 46 || (i >=48 && i <= 57));
		//@ts-ignore
		if (m !== n) {
		  tz[++y] = "";
		  //@ts-ignore
		  n = m;
		}
		tz[y] += j;
	  }
	  return tz;
	}
  
	var aa = chunkify(a);
	var bb = chunkify(b);
  
	for (var x = 0; aa[x] && bb[x]; x++) {
	  if (aa[x] !== bb[x]) {
		var c = Number(aa[x]), d = Number(bb[x]);
		if (c == aa[x] && d == bb[x]) {
		  return c - d;
		} else return (aa[x] > bb[x]) ? 1 : -1;
	  }
	}
	return aa.length - bb.length;
  }



module.exports = class System{
	static activeSystems = []
	static clusterInfoCache = {}
	static clusterInfoCacheCompressed = new Uint8Array()
	static clusterInfoCacheTime = -Infinity
	
	static getClusterInfo(compressed){
		var now = Date.now() / 1000
		if(now - System.clusterInfoCacheTime > 0.9){
			System.clusterInfoCacheTime = now
			var individual = []
			for(var x in System.activeSystems){
				individual.push(System.activeSystems[x].info)
			}
			individual.sort((a, b) => {
				// if(a.hostname == b.hostname){
				// 	return 0
				// }
				// return (a.hostname > b.hostname)? 1 : -1
				return alphanumSort(a.uid, b.uid)
			})
			var totalAverage = averageObjects(individual,{
				addKeys:["bytes","bytes_total", "watts","watts_limit","rx_bytes","rx_bytes_limit","tx_bytes","tx_bytes_limit"],
				ignoreKeys:["individual"],
			})
			System.clusterInfoCache = {
				average: totalAverage,
				individual: individual
			}
			var obj = compressJson.compress(obj)
			obj.type = "info"
			var binary = msgPack.encode(obj, {
				forceFloat32: true,
				ignoreUndefined: true
			})
			//may cause memory fragmentation if async
			//more testing would be necessary to determine if gzip shows the same behavior as deflate
			binary = zlib.gzipSync(binary)
			System.clusterInfoCacheCompressed = binary
		}
		if(compressed){
			return System.clusterInfoCacheCompressed
		}else{
			return System.clusterInfoCache
		}
		
	}
	
	
	
	
	info = {}
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
			this.info = (typeof obj.info == "object" ? obj.info || {} : {})
			this.info.hostname = this.hostname
			this.info.os = this.os
			if(this.info.cpu && this.info.cpu.individualUsage){
				// fix for old inconsistent naming
				this.info.cpu.individual_usage = this.info.cpu.individualUsage
				this.info.cpu.individualUsage = undefined
			}
			if(this.info.os && !this.info.system){
				// move old os info into system
				this.info.system = {
					average:{
						os: this.info.os
					}
				}
			}
			if(!this.initialized){
				var uid = this.hostname
				var counter = 1
				while(true){
					var collision = false
					for(var x in System.activeSystems){
						var system = System.activeSystems[x]
						if(system.uid == uid){
							collision = true
							counter++
							uid = this.hostname + " " + counter
							break
						}
					}
					if(collision == false){
						break
					}
				}
				this.uid = uid
				System.activeSystems.push(this)
				this.initialized = true
			}
			this.info.uid = this.uid
		}
		
	}
	async remove(){
		for(var x in System.activeSystems){
			//console.log(typeof x)
			if(System.activeSystems[x] == this){
				//@ts-ignore
				System.activeSystems.splice(x, 1)
				break
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