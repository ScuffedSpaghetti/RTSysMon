<template>
	<div>
		<div class="container box-background">
			<div class="title">{{compTitle}}</div>
			<div class="component">
				<div class="item" v-if="averageData.cpu">
					<div class="title">CPU</div>
					<DonutChart :size="compHeight*1.5" :usage="averageData.cpu.usage"/>
				</div>
				<div class="item" v-if="averageData.memory">
					<div class="title">Memory</div>
					<HorizontalBar :height="compHeight" :width="compWidth" :usage="averageData.memory.usage"/>
					<div class="info-text">{{toGB(averageData.memory.bytes)}}GB / {{toGB(averageData.memory.bytes_total)}}GB</div>
				</div>
				<div class="item" v-if="averageData.gpu">
					<div class="title">GPU</div>
					<DonutChart :size="compHeight*1.5" :usage="averageData.gpu.core.usage"/>
				</div>
				<div class="item" v-if="averageData.gpu">
					<div class="title">GPU Memory</div>
					<HorizontalBar :height="compHeight" :width="compWidth" :usage="averageData.gpu.memory.usage"/>
					<div class="info-text">{{toGB(averageData.gpu.memory.bytes)}}GB / {{toGB(averageData.gpu.memory.bytes_total)}}GB</div>
				</div>
				<div class="item" v-if="averageData.power">
					<div class="title">Power</div>
					<div class="info-text">{{averageData.power.watts.toFixed(1)}} Watts</div>
					<br>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'
export default {
  components: { DonutChart, HorizontalBar },
	props:{
		info:{
			type:Object,
			default:() => {},
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
	text-align: center;
	font-size: 2em;
}
.info-text{
	font-size: 1.5em;
}
</style>