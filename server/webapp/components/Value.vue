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
			<div class="info-text">{{addUnit(value.value, value.unit, value)}} / {{addUnit(value.value_limit, value.unit, value)}}</div>
		</template>
		<template v-else-if="value.type == 'donut_dual'">
			<DonutChartDual class="flex-child" :usageInner="value.usage_inner" :usageOuter="value.usage_outer" :size="height*1.5"/>
		</template>
		<template v-else>
			<div class="info-text" style="min-width:6em; white-space: pre-wrap;">{{addUnit(value.value, value.unit, value)}}</div>
		</template>
		<div class="info-text" v-if="value.extra_info">{{addUnit(value.extra_info, value.extra_info_unit)}}</div>
		<div class="info-text" v-if="value.description" style="white-space: pre-wrap;">{{value.description}}</div>
		<div class="info-text" v-if="value.description_node_only" style="white-space: pre-wrap;">{{value.description_node_only}}</div>
	</div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import DonutChartDual from './DonutChartDual.vue'
import HorizontalBar from './HorizontalBar.vue'
import OpacityBox from './OpacityBox.vue'

import {addUnit} from './helper.js'

export default {
	components: { DonutChart, DonutChartDual, OpacityBox, HorizontalBar },
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
	methods:{
		addUnit
	}
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