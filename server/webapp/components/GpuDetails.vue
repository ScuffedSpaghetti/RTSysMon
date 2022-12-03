<template>
	<div>
		<div class="container box-background" v-for="(x, i) in individualData" :key="i" style="margin-bottom:0.25em">
			<div class="title">GPU {{i}} | {{x.name}}</div>
			<div class="component">
				<div class="item" v-if="x.core">
					<div class="title">Utilization</div>
					<DonutChart class="flex-child" :usage="x.core.usage" :size="compHeight*1.5"/>
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
					<div class="text" style="min-width:6em;" v-if="x.power.watts_limit == undefined">{{x.power.watts.toFixed(1)}}Watts</div>
					<div v-else>
						<HorizontalBar class="flex-child" :usage="x.power.usage" :height="compHeight" :width="compWidth"/>
						<div class="info-text">{{x.power.watts.toFixed(1)}}Watts / {{x.power.watts_limit.toFixed(1)}}Watts</div>
					</div>
				</div>
				<div class="item item-compact" v-if="x.bus">
					<div class="title">Bus</div>
					<div class="info-text">{{x.bus.type}} gen{{Math.round(x.bus.generation)}} {{x.bus.width}}x</div>
					<div class="info-text" v-if="x.bus.generation_max">max gen{{Math.round(x.bus.generation_max)}} {{x.bus.width_max}}x</div>
					<div class="info-text">TX: {{toGB(x.bus.tx_bytes)}}GB</div>
					<div class="info-text">RX: {{toGB(x.bus.rx_bytes)}}GB</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'

export default{
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
	data() {
		return {

		}
	},
	mounted() {
		
	},
	methods: {
		toGB(bytes){
			return (bytes / 1024 / 1024 / 1024).toFixed(1)
		},
	},
	computed:{
		individualData(){
			if(!this.info){
				return
			}
			if(this.info.individual){
				return this.info.individual
			}
			return [this.info.average]
		}
	},
	components:{
		DonutChart,
		HorizontalBar,
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
.item-compact{
	justify-content: center;
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