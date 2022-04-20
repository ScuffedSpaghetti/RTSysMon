<template>
	<div>
		<div v-if="averageData.cpu">
			<OpacityBox :usage="cpuUsage" :height="5" :width="5" style="padding:0.5em"/>><NutChart :usage="cpuUsage * 4"/>
		</div>
		<div>
			<LargeComputerOverview :info="averageData" :compTitle="'Whole System Network Overview'" style="padding:0.5em"/>
		</div>
		
		<br>
		<pre>{{text}}</pre>
		<div>Total string data received: {{totalDataString.toLocaleString()}} bytes</div>
		<div>Total buffer data received: {{totalDataBuffer.toLocaleString()}} bytes</div>
	</div>
</template>

<script>
import DonutChart from "./DonutChart.vue"
import HorizontalBar from './HorizontalBar.vue'
import OpacityBox from "./OpacityBox.vue"
import LargeComputerOverview from './LargeComputerOverview.vue'
import SmallComputerOverview from "./SmallComputerOverview.vue"
import NutChart from './DonutChart.vue'

export default {
	 props:{
        info:{
			type:Object,
			default:{}
		},
    },
	data(){ 
		return{
			totalDataString:0,
			totalDataBuffer:0,
		}
	},
	mounted(){
		
	},
	computed:{
       averageData(){
		   return this.info.average
	   },
	   cpuUsage(){
		   return this.info.average.cpu.average.usage
	   },
	   text(){
		   return JSON.stringify(this.info,null,2)
	   }
    },
	components:{
		DonutChart,
		HorizontalBar,
		LargeComputerOverview,
		OpacityBox,
		NutChart
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

</style>