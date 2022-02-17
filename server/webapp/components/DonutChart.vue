<template>
	<div class="container" :style="{width:size+'em',height:size+'em'}" ref="container">
		<ejs-accumulationchart ref="pie" style="display:inline-block; margin:auto" :enableBorderOnMouseMove="false" :height="pxSize.toString()" :width="pxSize.toString()">
			<e-accumulation-series-collection>
				<e-accumulation-series :dataSource='seriesData' type='Pie' xName='x' yName='y' innerRadius="50%" pointColorMapping='fill'></e-accumulation-series>
			</e-accumulation-series-collection>
		</ejs-accumulationchart>
		<label class="label" :style="{fontSize:size/10+'em'}">{{usage.toFixed(1)}}%</label>
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
		}
	},
	data() {
		return {
			seriesData: [
				{y: 0, fill:"#ff5555"},
				{y: 0, fill:"#33ff99"},
				{y: 100, fill:"#999999"}
			],
			pxSize:1,
		};
	},
	methods: {
		updateChart(usage) {
			if(this.$refs.pie && this.$refs.pie.ej2Instances){
				this.$refs.pie.ej2Instances.series[0].dataSource[1].y = usage
				this.$refs.pie.ej2Instances.series[0].dataSource[2].y = Math.max(100 - usage, 0)
				if(usage > 100){
					usage = Math.min(usage,200)
					this.$refs.pie.ej2Instances.series[0].dataSource[0].y = usage - 100
					this.$refs.pie.ej2Instances.series[0].dataSource[1].y = 200 - usage
				}else{
					this.$refs.pie.ej2Instances.series[0].dataSource[0].y = 0
				}
				// this.$refs.pie.ej2Instances.series[0].dataSource = seriesData
				// this.$refs.pie.ej2Instances.series[0].dataSource = seriesData
				this.$refs.pie.ej2Instances.animate();
			}
		},
		getPxSize(){
			console.log("pxSize")
			this.pxSize = Math.min(this.$refs.container.clientHeight, this.$refs.container.clientWidth)
		}
	},
	mounted(){
		this.getPxSize()
	},
	watch: {
		usage: {
			immediate: true,
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
.container{
	display:inline-block; 
	position:relative;
}

</style>