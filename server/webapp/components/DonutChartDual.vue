<template>
	<div class="container-donut-chart" :style="{width:size+'em',height:size+'em'}" >
		<svg ref="svg" viewBox="0 0 100 100" style="transform: rotate(-90deg)">
			<g>
				<circle cx="50" cy="50" :r="25 + innerRadius/4" fill="none" :stroke="colorBackground" :stroke-width="50 - innerRadius/2 - 0.25"/>
				<circle cx="50" cy="50" :r="25 - (100 - innerRadius) / 8 + innerRadius/4" fill="none" :stroke="colorInner" :stroke-width="(50 - innerRadius/2) / 2" pathLength="1" stroke-dasharray="0 1" ref="pie1" :style="animationStyle"/>
				<circle cx="50" cy="50" :r="25 + (100 - innerRadius) / 8 + innerRadius/4" fill="none" :stroke="colorOuter" :stroke-width="(50 - innerRadius/2) / 2" pathLength="1" stroke-dasharray="0 1" ref="pie2" :style="animationStyle"/>
			</g> 
		</svg>
		<div class="label" :style="{fontSize:size/9+'em'}">{{text == "" ? usageOuter.toFixed(1) + "%\n" + usageInner.toFixed(1) + "%": text}}</div>
	</div>
</template>

<script>
export default {
	props:{
		usageInner: {
			type: Number,
			default: 0,
		},
		usageOuter: {
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
			colorInner: "#0dec2b",
			colorOuter: "#0dec2b",
			pxSize:1,
		};
	},
	methods: {
		updateChart() {
			var usage = this.usageInner
			var usage2 = this.usageOuter
			if(this.$refs.pie1){
				var dasharray = "0 1"
				var dasharray2 = "0 1"
				if(usage >= 0.01){
					dasharray = usage/100 + " 1"
				}
				if(usage>=100){
					dasharray = "1 0"
				}
				if(usage2 >= 0.01){
					dasharray2 = usage2/100 + " 1"
				}
				if(usage2>=100){
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
		this.updateChart()
	},
	watch: {
		usageInner: {
			immediate: false,
			handler(usage){
				this.updateChart()
			}
		},
		usageOuter: {
			immediate: false,
			handler(usage){
				this.updateChart()
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
	white-space: pre-wrap;
	text-align: center;
}
.container-donut-chart{
	display: inline-block; 
	position: relative;
}


</style>