<template>
	<div>
		<div class="container box-background">
			<div class="title">{{this.info?this.info.average.model:""}}</div>
			<div class="component" v-if="this.info?this.info.individual_usage:undefined">
				<div class="item" v-for="(x, i) in this.info.individual_usage" :key="i">
					<OpacityBox class="flex-child" :usage="x" :height="compHeight" :width="compWidth"/>
					<div class="info-text">Core {{i}}</div>
				</div>
			</div>
			<div class="component">
				<div class="item" v-if="this.info?this.info.average.temperature != undefined:undefined">
					<div class="title">Temperature</div>
					<DonutChart class="flex-child" :usage="this.info.average.temperature" :text="this.info.average.temperature.toFixed(1) + '°C'" :size="compHeight*1.5"/>
				</div>
				<div class="item" v-if="this.info?this.info.average.power:undefined">
					<div class="title">Power</div>
					<div class="text" style="min-width:6em;">{{this.info.average.power.watts.toFixed(1)}}Watts</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import OpacityBox from "./OpacityBox.vue"

export default{
	props:{
		info:{
			type:Object,
			default:()=>{}
		},
		compHeight:{
			type: Number,
			default: 4,
		},
		compWidth: {
			type: Number,
			default: 4,
		},
	},
	data() {
		return {
			
		}
	},
	mounted() {
		
	},
	methods: {
		
	},
	computed:{

	},
	components:{
		OpacityBox,
		DonutChart,
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
	text-align: center;
	font-size: 2em;
	align-self: center;
}
.info-text{
	text-align: center;
	font-size: 0.75em;
	align-self: center;
}
.text{
	text-align: center;
	font-size: 1.5em;
	align-self: center;
}
.flex-child{
	align-self: center;
}
</style>