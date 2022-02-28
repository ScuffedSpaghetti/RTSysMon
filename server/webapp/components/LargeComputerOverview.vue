<template>
<div>
	<br>
	<div class="container box-background">
		<div class="item" v-if="averageData.cpu">
			<div class="title">CPU</div>
			<DonutChart :size="20" :usage="averageData.cpu.usage"/>
		</div>
		<div class="item" v-if="averageData.memory">
			<div class="title">Memory</div>
			<HorizontalBar :height="14" :width="30" :usage="averageData.memory.usage"/>
			<div class="info-text">{{toGB(averageData.memory.bytes)}}GB / {{toGB(averageData.memory.bytes_total)}}GB</div>
		</div>
		<div class="item" v-if="averageData.power">
			<div class="title">Power</div>
			<div class="info-text">{{averageData.power.watts.toFixed(1)}} Watts</div>
			<br>
		</div>
	</div>
	<br>
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
			//console.log(out)
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
	border-radius: 1em;
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
	font-size: 4em;
}
.info-text{
	font-size: 3em;
}
</style>