<template>
	<div>
		<div>
			<DonutChart :usage="cpuUsage" :size="20"/>
			<HorizontalBar :usage="cpuUsage" :width="20" :height="20" />
		</div>
		<br>
		<div><LargeComputerOverview :info="averageData" :compHeight="14" :compWidth="30" /></div>
		<br>
		<pre>{{text}}</pre>
		<div>Total string data received: {{totalDataString.toLocaleString()}} bytes</div>
		<div>Total buffer data received: {{totalDataBuffer.toLocaleString()}} bytes</div>
	</div>
</template>

<script>
import DonutChart from "./DonutChart.vue"
import HorizontalBar from './HorizontalBar.vue'
import LargeComputerOverview from './LargeComputerOverview.vue'
import SmallComputerOverview from "./SmallComputerOverview.vue"

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
		SmallComputerOverview
	}
}
</script>

<style>

.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}

</style>