<template>
<div class="outer" :style="outerStyle">
	<div class="inner" :class="{animate: this.$root.animation !== false}" :style="innerStyle">
		
	</div>
	<div class="inner inner2" :class="{animate: this.$root.animation !== false}" :style="inner2Style">
		
	</div>
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
			},
			inner2Style:{
				width:undefined,
				height:undefined,
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
				usage = Math.min(usage,200)
				this.innerStyle.width = "100%"
				this.inner2Style.width = usage - 100 + "%"
			}else{
				this.innerStyle.width = usage + "%"
				this.inner2Style.width = "0%"
			}
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
	transition: width 0.7s linear, height 0.7s linear;
}
.inner{
	display:inline-block;
	height: 100%;
	width: 0%;
	position: absolute;
	top:0%;
	left: 0%;
	background-color: #33ff99;
}
.inner2{
	background-color: #ff5555;
}
.label {
	top: 50%;
	left: 50%;
	position: absolute;
	transform: translate(-50%, -50%);
	text-shadow: 0em 0em 0.1em #ffffff;
	color: black;
}
</style>