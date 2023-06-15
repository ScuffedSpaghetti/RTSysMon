<template>
<div>
	<div class="container box-background" :style="averageData.style">
		<div class="title">{{compTitle}}</div>
		<div class="component">
			<div class="item" v-if="averageData.cpu">
				<div class="title">CPU</div>
					<DonutChart class="flex-child" :size="compHeight*1.5" :usage="averageData.cpu.usage"/>
			</div>
			<div class="item" v-if="averageData.memory">
				<div class="title">Memory</div>
					<HorizontalBar class="flex-child" :height="compHeight" :width="compWidth" :usage="averageData.memory.usage"/>
				<div class="info-text">{{toGB(averageData.memory.bytes)}}GB / {{toGB(averageData.memory.bytes_total)}}GB</div>
			</div>
			<div class="item" v-if="averageData.warning" style="color:#FF7601;">
				<div class="title">Warning</div>
				<div class="info-text" style="min-width:4em;">{{averageData.warning}}</div>
			</div>
			<div class="item" v-if="averageData.error" style="color:red;">
				<div class="title">Warning</div>
				<div class="info-text" style="min-width:4em;">{{averageData.error}}</div>
			</div>
		</div>
		<div class="component">
			<div class="item" v-if="averageData.gpu && averageData.gpu.core">
				<div class="title">GPU</div>
				<!-- <div class="component"> -->
					<DonutChart class="flex-child" :size="compHeight*1.5" :usage="averageData.gpu.core.usage"/>
				<!-- </div> -->
			</div>
			<div class="item" v-if="averageData.gpu && averageData.gpu.memory">
				<div class="title">GPU Memory</div>
					<HorizontalBar class="flex-child" :height="compHeight" :width="compWidth" :usage="averageData.gpu.memory.usage"/>
				<div class="info-text">{{toGB(averageData.gpu.memory.bytes)}}GB / {{toGB(averageData.gpu.memory.bytes_total)}}GB</div>
			</div>
			<div class="item" v-if="averageData.power && averageData.power.watts != undefined">
				<div class="title">Power</div>
				<div class="info-text" style="min-width:6em;">{{averageData.power.watts.toFixed(1)}} Watts</div>
			</div>
		</div>
		<div class="component" v-if="info.extra != undefined">
			<template v-for="(extra, i) in info.extra">
				<template v-for="(value, i2) in extra.average.values_overview">
					<Value class="item" :key="i+' '+i2" :value="value" :height="compHeight" :width="compWidth"/>
				</template>
			</template>
		</div>
	</div>
</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'
import Value from './Value.vue'
export default {
	components: { DonutChart, HorizontalBar, Value },
	props:{
		info:{
			type:Object,
			default:() => {}
		},
		compHeight:{
			type: Number,
			default: 7,
		},
		compWidth: {
			type: Number,
			default: 14,
		},
		compTitle:{
			type: String,
			default: "",
		},
	},
	methods:{
		toGB(bytes){
			return (bytes / 1024 / 1024 / 1024).toFixed(1)
		},
	},
	computed:{
		averageData(){
			var data = this.info
			var out = {}
			for(var x in data){
				var item = data[x]
				out[x] = item.average
				if(item.warning){
					if(out.warning){
						out.warning += " | " + item.warning
					}else{
						out.warning = item.warning
					}
				}
				if(item.error){
					if(out.error){
						out.error += " | " + item.error
					}else{
						out.error = item.error
					}
				}
			}
			for(var x in data.extra){
				var extraItem = data.extra[x].average
				if(extraItem.warning){
					if(out.warning){
						out.warning += " | " + extraItem.warning
					}else{
						out.warning = extraItem.warning
					}
				}
				if(extraItem.error){
					if(out.error){
						out.error += " | " + extraItem.error
					}else{
						out.error = extraItem.error
					}
				}
			}
			out.style = {}
			if(out.outline){
				out.style.outline = "solid " + (out.outline.width || 0.3) + "em rgb(" + out.outline.r + "," + out.outline.g + "," + out.outline.b + ")"
			}
			//console.log(out)
			return out
		},
	}
}
</script>

<style scoped>

.component{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
}

.container{
	display: flex;
	flex-direction: column;
	flex-flow: column wrap;
	justify-content: space-around;
	border-radius: 1em;
	padding: 0.5em;
}
.item{
	align-content: center;
	text-align: center;
	padding: 0.5em;
	display: flex;
	flex-direction: column;
	flex-flow: column wrap;
	justify-content: space-around;
}
.flex-break{
	flex-basis: 100%;
	height: 0;
}
.title{
	text-align: center;
	font-size: 1.5em;
	align-self: center;
}
.info-text{
	font-size: 1em;
	align-self: center;
}
.flex-child{
	align-self: center;
}
</style>