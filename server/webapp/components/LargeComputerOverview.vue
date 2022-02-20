<template>
<div class="container">
	<div class="item" v-if="averageData.cpu">
		<div class="title">CPU</div>
		<donut-chart :size="10" :usage="averageData.cpu.usage"/>
	</div>
	<div class="item" v-if="averageData.memory">
		<div class="title">Memory</div>
		<horizontal-bar :height="7" :width="15" :usage="averageData.memory.usage"/>
		<div class="info-text">{{toGB(averageData.memory.bytes)}}GB / {{toGB(averageData.memory.bytes_total)}}GB</div>
	</div>
	<div class="item" v-if="averageData.power">
		<div class="title">Power</div>
		<br>
		<div class="info-text">{{averageData.power.watts.toFixed(1)}} Watts</div>
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
			default:{}
		}
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
			console.log(out)
			return out
		},
	}
}
</script>

<style scoped>
.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	background-color: #eeeeee;
	border-radius: 1em;
}
.item{
	text-align: center;
	padding: 0.5em;
}
.title{
	font-size: 2em;
}
.info-text{
	font-size: 1.5em;
}
</style>