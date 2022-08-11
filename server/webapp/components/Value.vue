<template>
	<div v-if="value">
		<div class="title">{{value.title}}</div>
		<template v-if="value.type == 'donut'">
			<DonutChart class="flex-child" :usage="value.usage" :size="height*1.5"/>
		</template>
		<template v-else-if="value.type == 'opacity'">
			<OpacityBox class="flex-child" :usage="value.usage" :height="height" :width="height"/>
		</template>
		<template v-else-if="value.type == 'bar'">
			<HorizontalBar class="flex-child" :usage="value.usage" :height="height" :width="width"/>
			<div class="info-text">{{value.value.toFixed(1)}} {{value.unit||""}} / {{value.value_limit.toFixed(1)}} {{value.unit||""}}</div>
		</template>
		<template v-else>
			<div class="info-text" style="min-width:6em;">{{value.value}} {{value.unit||""}}</div>
		</template>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'
import OpacityBox from './OpacityBox.vue'
export default {
  components: { DonutChart, OpacityBox, HorizontalBar },
	props:{
        value:{
			type:Object,
			default:()=>{}
		},
        height:{
			type: Number,
			default: 5,
		},
		width: {
			type: Number,
			default: 10,
		},
    },
}
</script>

<style>
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