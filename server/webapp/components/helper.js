export function addUnit(value,unit,obj){
	obj = obj || {}
	obj.decimals = (obj.decimals != undefined ? obj.decimals : 1)
	obj.display_days = obj.display_days || false
	if(typeof value == "string"){
		return value + (unit ? " " + unit : "")
	}else if(unit == "time"){
		function pad(num,length){
			if(typeof num == "number"){
				num = num.toString()
			}
			while(num.length < length){
				num = "0"+num
			}
			return num
		}
		var hours = Math.floor(value / 3600)
		var minutes = pad(Math.floor((value / 60) % 60), 2)
		var seconds = pad(Math.floor(value % 60), 2)
		var output = ""
		output += (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds
		if(obj.display_days){
			output += " (" + (value / 86400).toFixed(obj.decimals) + " days)"
		}
		return output
	}else if(unit == "date"){
		var date = new Date(value * 1000)
		var now = Date.now() / 1000
		var nowDate = new Date(now * 1000)
		var output = ""
		// display date if not occurring on the same date as today
		if(nowDate.toLocaleDateString() != date.toLocaleDateString()){
			if(value - now > 0 && (value - now) / 86400 <= 6){
				// display only day of week when less than 6 days in the future
				output = dayMap[date.getDay()] + " "
			}else{
				// otherwise display full date
				if(date.getFullYear() != nowDate.getFullYear()){
					output = date.getFullYear() + "/"
				}
				output += (date.getMonth() + 1) + "/" + (date.getDate()) + " "
			}
		}
		
		output += date.toLocaleTimeString(undefined, {timeStyle:"short"})
		return output
	}else{
		return (typeof value == "number" ? value.toFixed(obj.decimals) : value) + (unit ? " " + unit : "")
	}
}