<template>
	<div>
		<slot :data="averageData" :individualData="individualData"/>
	</div>
</template>

<script>
export default {
	props:{
		info:{
			type:Object,
			default:{}
		}
	},
	computed:{
		averageData(){
			var data = this.info
			var out = {}
			for(var x in data){
				var item = data[x]
				out[x] = item.average
			}
			return out
		},
		individualData(){
			var data = this.info
			var out = {}
			for(var x in data){
				var item = data[x]
				out[x] = item.individual
			}
			return out
		}
	}
}
</script>

<style scoped>

</style>