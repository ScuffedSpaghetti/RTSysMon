<template>
	<span class="donut" v-bind:style="styleObject"></span>
</template>

<script>
export default {
	props:{
		size: String,
		thickness: String,
	},
	data(){
		return {
			
		}
	},
	computed:{
		styleObject(){
			return {
				borderWidth: this.thickness || "1em",
				width: this.size || "4em",
				height: this.size || "4em",
			}
		}
	}
}
</script>

<style>
	.donut{
		border: green solid 0.5em;
		display: inline-block;
		border-radius: 50%;
	}
</style>