<template>
	<div v-if="value">
		<div class="title">{{value.title}}</div>
		<template v-if="value.type == 'donut'">
			<DonutChart class="flex-child" :usage="value.usage" :size="height*1.5"/>
		</template>
		<template v-else-if="value.type == 'opacity'">
			<OpacityBox class="flex-child" :usage="value.usage" :height="height" :width="height"/>
		</template>
		<template v-else-if="value.type == 'bar'">
			<HorizontalBar class="flex-child" :usage="value.usage" :height="height" :width="width"/>
			<div class="info-text">{{addUnit(value.value, value.unit, value)}} / {{addUnit(value.value_limit, value.unit, value)}}</div>
			<div class="info-text" v-if="value.extra_info">{{addUnit(value.extra_info, value.extra_info_unit)}}</div>
		</template>
		<template v-else-if="value.type == 'donut_dual'">
			<DonutChartDual class="flex-child" :usageInner="value.usage_inner" :usageOuter="value.usage_outer" :size="height*1.5"/>
		</template>
		<template v-else>
			<div class="info-text" style="min-width:6em; white-space: pre-wrap;">{{addUnit(value.value, value.unit, value)}}</div>
		</template>
		<div class="info-text" v-if="value.description" style="white-space: pre-wrap;">{{value.description}}</div>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import DonutChartDual from './DonutChartDual.vue'
import HorizontalBar from './HorizontalBar.vue'
import OpacityBox from './OpacityBox.vue'

let dayMap = {
	0: "Sun",
	1: "Mon",
	2: "Tue",
	3: "Wed",
	4: "Thu",
	5: "Fri",
	6: "Sat",
}

export default {
	components: { DonutChart, DonutChartDual, OpacityBox, HorizontalBar },
	props:{
		value:{
			type:Object,
			default:()=>{}
		},
		height:{
			type: Number,
			default: 5,
		},
		width: {
			type: Number,
			default: 10,
		},
	},
	methods:{
		addUnit(value,unit,obj){
			obj = obj || {}
			obj.decimals = (obj.decimals != undefined ? obj.decimals : 1)
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
				return (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds
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
	}
}
</script>

<style>
.title{
	align-self: center;
	text-align: center;
	font-size: 2em;
}
.info-text{
	align-self: center;
	text-align: center;
	font-size: 1em;
}
.flex-child{
	align-self: center;
}
</style>