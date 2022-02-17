<template>
	<div>
		<h1>The scuffed vue ui goes here</h1>
		<p>
			<Test/>
			<DonutChart/>
		</p>
	</div>
	
</template>

<script>
import Vue from "vue"
import Test from "./components/Test.vue"
import DonutChart from "./components/DonutChart.vue"
import { AccumulationChartPlugin, ChartPlugin, PieSeries } from "@syncfusion/ej2-vue-charts";

Vue.use(AccumulationChartPlugin);
Vue.use(ChartPlugin);

export default {
	components:{
		Test,
		DonutChart
	},
	provide:{
		// accumulationchart: [PieSeries]
	}
}
</script>

<style>

</style>