<template>
	<div class="top-nav" ref="nav">
		<router-link ref="home" class="active" :to="'/'">Home</router-link>
		<router-link ref="settings" :to="'/settings'">Settings</router-link>
		<router-link ref="about" v-if="this.$root.showAboutPage" :to="'/about'">About</router-link>
		<div class="search-bar-container">
			<SearchAutocomplete class="search-bar" :items="hostnames"/>
		</div>
	</div>
</template>

<script>
import SearchAutocomplete from "./SearchAutocomplete.vue";

export default{
	props:{
		info:{
			type:Object,
			default:{}
		}, 
	},
	data() {
		return {
			
		};
	},
	components: { 
		SearchAutocomplete,
	},
	computed:{
		hostnames(){
			var hosts = []
			for(var x in this.info.individual){
				// console.log("host: " + this.info.individual[x].hostname)
				hosts[x] = this.info.individual[x].uid
			}
			return hosts
		},
	},
}
</script>


<style scoped>
.search-bar-container {
	position: absolute;
	right: 0em;
	float: right;
	margin: 0.6em;
}
.top-nav {
	overflow: hidden;
	position: static;
	
}
.top-nav a {
	float: left;
	text-align: center;
	padding: 0.8em 1em;
	text-decoration: none;
	font-size: 1em;
}
.top-nav a.active {
	
}
.search-bar {

}
</style>