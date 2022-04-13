<template>
    <div class="top-nav">
		<router-link class="active" :to="'/'">Home</router-link>
		<router-link :to="'/about'">About</router-link>
		<router-link :to="'/settings'">Settings</router-link>
		<div class="container">
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
	}
}
</script>


<style scoped>
.container {
	display: inline-block;
	position: absolute;
	top: 0.7em;
	right: 1em;
}
.top-nav {
  	overflow: hidden;
	position: static;
	
}
.top-nav a {
	float: left;
	text-align: center;
	padding: 14px 16px;
	text-decoration: none;
	font-size: 17px;
}
.top-nav a.active {
	/* background-color: #35d6ec; */
	/* background-color: #C5050C; */
}
.search-bar {
	position: relative;
  	/* float: right; */
}
</style>