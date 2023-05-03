<template>
	<div>
		<template v-if="info.customDisplay">
			
		</template>
		<template v-else>
			 <div v-if="info.usage != undefined">
				
			 </div>
			<div class="container box-background" v-for="(x, i) in individualData" :key="i" style="margin-bottom:0.25em" :style="x.style">
				<div class="title" v-if="x.title">{{x.title}}</div>
				<div class="info-text" v-if="x.description">{{x.description}}</div>
				<div class="component">
					<div class="item" v-if="x.usage != undefined">
						<div class="title">Utilization</div>
						<DonutChart class="flex-child" :usage="x.usage" :size="compHeight*1.5"/>
					</div>
					<div class="item" v-if="x.memory">
						<div class="title">Memory</div>
						<HorizontalBar class="flex-child" :usage="x.memory.usage" :height="compHeight" :width="compWidth"/>
						<div class="info-text">{{toGB(x.memory.bytes)}}GB / {{toGB(x.memory.bytes_total)}}GB</div>
					</div>
					<div class="item" v-if="x.temperature != undefined">
						<div class="title">Temperature</div>
						<DonutChart class="flex-child" :usage="x.temperature" :text="x.temperature.toFixed(1) + '°C'" :size="compHeight*1.5"/>
					</div>
					<div class="item" v-if="x.fan_speed != undefined">
						<div class="title">Fan</div>
						<DonutChart class="flex-child" :usage="x.fan_speed" :size="compHeight*1.5"/>
					</div>
					<div class="item" v-if="x.power">
						<div class="title">Power</div>
						<HorizontalBar class="flex-child" v-if="x.power.usage != undefined" :usage="x.power.usage" :height="compHeight" :width="compWidth"/>
						<div class="info-text" v-if="x.power.watts_limit != undefined">{{x.power.watts.toFixed(1)}} Watts / {{x.power.watts_limit.toFixed(1)}} Watts</div>
						<div class="info-text" v-else style="min-width:6em;">{{x.power.watts.toFixed(1)}} Watts</div>
					</div>
					<div class="item" v-if="x.bus">
						<div class="title">Bus</div>
						<div class="info-text">{{x.bus.type}} gen{{Math.round(x.bus.generation)}} {{x.bus.width}}x</div>
						<div class="info-text">TX: {{toGB(x.bus.tx_bytes)}}GB</div>
						<div class="info-text">RX: {{toGB(x.bus.rx_bytes)}}GB</div>
					</div>
					
					<div class="item" v-if="x.status">
						<div class="title">Status</div>
						<div class="info-text" style="min-width:6em;">{{x.status}}</div>
					</div>
					<Value class="item" v-for="(value, i2) in x.values" :key="i2" :value="value" :height="compHeight" :width="compWidth"/>
					<div class="item" v-if="x.warning" style="color:#FF7601;">
						<div class="title">Warning</div>
						<div class="info-text" style="min-width:4em;">{{x.warning}}</div>
					</div>
					<div class="item" v-if="x.error" style="color:red;">
						<div class="title">Warning</div>
						<div class="info-text" style="min-width:4em;">{{x.error}}</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'
import OpacityBox from './OpacityBox.vue'
import Value from './Value.vue'
export default {
	components: { DonutChart, HorizontalBar, OpacityBox, Value },
	props:{
		info:{
			type:Object,
			default:()=>{}
		},
		compHeight:{
			type: Number,
			default: 5,
		},
		compWidth: {
			type: Number,
			default: 10,
		},
	},
	computed:{
		individualData(){
			if(!this.info){
				return
			}
			var outArray = []
			if(this.info.individual){
				outArray = this.info.individual
			}else{
				outArray = [this.info.average]
			}
			for(var x in outArray){
				var item = outArray[x]
				item.style = {}
				if(item.outline){
					item.style.outline = "solid 0.3em rgb(" + item.outline.r + "," + item.outline.g + "," + item.outline.b + ")"
				}
			}
			return outArray
		},
	},
}
</script>

<style scoped>
.component{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
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
	text-align: center;
	padding: 0.5em;
	display: flex;
	flex-direction: column;
	flex-flow: column wrap;
	justify-content: space-around;
	border-radius: 1em;
}
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