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
import Test from "./components/Test.vue"
import DonutChart from "./components/DonutChart.vue"

export default {
	components:{
		Test,
		DonutChart
	}
}
</script>

<style>

</style>