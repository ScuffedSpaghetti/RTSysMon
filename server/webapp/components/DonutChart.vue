<template>
	<div class="container-donut-chart" :style="{width:size+'em',height:size+'em'}" >
		<svg ref="svg" viewBox="0 0 100 100" style="transform: rotate(-90deg)">
			<g>
				<circle cx="50" cy="50" :r="25 + innerRadius/4" fill="none" :stroke="colorBackground" :stroke-width="50 - innerRadius/2 - 0.25"/>
				<circle cx="50" cy="50" :r="25 + innerRadius/4" fill="none" :stroke="colorMain" :stroke-width="50 - innerRadius/2" pathLength="1" stroke-dasharray="0 1" ref="pie1" :style="animationStyle"/>
				<circle cx="50" cy="50" :r="25 + innerRadius/4" fill="none" :stroke="colorSecondary" :stroke-width="50 - innerRadius/2" pathLength="1" stroke-dasharray="0 1" ref="pie2" :style="animationStyle"/>
			</g> 
		</svg>
		<div class="label" :style="{fontSize:size/8+'em'}">{{text == "" ? usage.toFixed(1) + "%" : text}}</div>
	</div>
</template>

<script>
export default {
	props:{
		usage: {
			type: Number,
			default: 0,
		},
		size: {
			type: Number,
			default: 20,
		},
		innerRadius: {
			type: Number,
			default: 45,
		},
		text: {
			type: String,
			default: "",
		}
	},
	data() {
		return {
			colorBackground: "#555555",
			colorMain: "#0dec2b",
			colorSecondary: "#ff0000",
			pxSize:1,
		};
	},
	methods: {
		updateChart(usage) {
			if(this.$refs.pie1){
				var dasharray = usage/100 + " 1"
				var dasharray2 = "0 1"
				if(usage>=100){
					dasharray = "1 0"
				}
				if(usage>100){
					dasharray2 = (usage-100)/100 + " 1"
				}
				if(usage>=200){
					dasharray2 = "1 0"
				}
				this.$refs.pie1.setAttribute("stroke-dasharray", dasharray)
				this.$refs.pie2.setAttribute("stroke-dasharray", dasharray2)
			}
		},
	},
	computed:{
		animationStyle(){
			var style = {}
			if(this.$root.animation !== false){
				style.transition = "stroke-dasharray 0.7s linear"
			}
			return style
		}
	},
	mounted(){
		this.updateChart(this.usage)
	},
	watch: {
		usage: {
			immediate: false,
			handler(usage){
				this.updateChart(usage)
			}
		}
	},
};
</script>

<style scoped>

.label {
	top: 50%;
	left: 50%;
	position: absolute;
	transform: translate(-50%, -50%);
}
.container-donut-chart{
	display: inline-block; 
	position: relative;
}


</style>