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
		</template>
		<template v-else>
			<div class="info-text" style="min-width:6em; white-space: pre-wrap;">{{addUnit(value.value, value.unit, value)}}</div>
		</template>
		<div class="info-text" v-if="value.description" style="white-space: pre-wrap;">{{value.description}}</div>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'
import OpacityBox from './OpacityBox.vue'
export default {
	components: { DonutChart, OpacityBox, HorizontalBar },
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
			}else{
				return value.toFixed(obj.decimals) +  (unit ? " " + unit : "")
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