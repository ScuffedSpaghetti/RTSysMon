<template>
<div class="outer" :style="outerStyle">
	<div class="inner" id="in" :class="{animate: this.$root.animation !== false}" :style="innerStyle"></div>
	<label class="label" :style="{fontSize:(size || height)/5+'em'}">{{usage.toFixed(1)}}%</label>
</div>
</template>

<script>
export default {
	data(){
		return{
			outerStyle:{
				width:undefined,
				height:undefined,
			},
			innerStyle:{
				width:undefined,
				height:undefined,
				backgroundColor:"#0dec2b00",
			},
		}
	},
	props:{
		usage: {
			type: Number,
			default: 0,
		},
		width:Number,
		height:Number,
		size:Number,
	},
	methods: {
		updateChart(usage) {
			if(usage > 100){
				usage = (Math.min(usage,200) - 100) / 100
				var r = 13 * (1 - usage) + 255 * Math.min(usage * 2,1);
				var g = 236 * (1 - Math.max(usage * 2 - 1,0));
				var b = 43 * (1 - usage);
				this.innerStyle.backgroundColor = "rgba(" + r + "," + g + "," + b +",1)"
				//var h = 128 * (1 - usage);
				//var s = 90 * (1 - usage) + 100 * usage;
				//this.innerStyle.backgroundColor = "hsl(" + h + ", " + s + "%, 50%, 1)"
			}else{
				this.innerStyle.backgroundColor = "rgba(13,236,43," + usage/100 + ")"
				//this.innerStyle.backgroundColor = "hsl(128, 90%, 50%," + usage/100 + ")"
			}
		},
		addAlpha(color, opacity) {
			opacity = opacity / 100
			var alpha = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255).toString(16).toUpperCase();
			while(alpha.length < 2){
				alpha = "0" + alpha
			}
			return color + alpha;
		},
	},
	watch: {
		usage: {
			immediate: true,
			handler(usage){
				this.updateChart(usage)
			}
		},
		height: {
			immediate: true,
			handler(val){
				if(val){
					this.outerStyle.height = val + "em"
				}else{
					this.outerStyle.height = undefined
				}
			}
		},
		width: {
			immediate: true,
			handler(val){
				if(val){
					this.outerStyle.width = val + "em"
				}else{
					this.outerStyle.width = undefined
				}
			}
		},
		// size: {
		// 	immediate: true,
		// 	handler(val){
		// 		if(val){
		// 			this.outerStyle.width = val + "em"
		// 			this.outerStyle.height = val + "em"
		// 		}else{
		// 			this.outerStyle.width = undefined
		// 			this.outerStyle.height = undefined
		// 		}
		// 	}
		// },
	},
}
</script>

<style scoped>
.outer{
	display:inline-block;
	position:relative;
	background-color: #555555;
	border-radius: 5%;
	overflow: hidden;
}
.animate{
	transition: background-color 0.7s linear;
}
.inner{
	display:inline-block;
	height: 100%;
	width: 100%;
	position: absolute;
	top:0%;
	left: 0%;
}
.label {
	top: 50%;
	left: 50%;
	position: absolute;
	transform: translate(-50%, -50%);
	/* text-shadow: 0em 0em 0.1em #ffffff; */
	color: #ffffff;
}
</style>