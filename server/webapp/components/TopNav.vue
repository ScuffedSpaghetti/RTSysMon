<template>
    <div class="top-nav">
        <a class="active" href="#home">Home</a>
		<a href="#about">About</a>
		<div class="container">
			<SearchAutocomplete class="search-bar" :items="[
			'Apple',
			'Banana',
			'Orange',
			'Mango',
			'Pear',
			'Peach',
			'Grape',
			'Tangerine',
			'Pineapple'
			]"/>
		</div>
    </div>
</template>

<script>
import SearchAutocomplete from "./SearchAutocomplete.vue";

export default{
    data() {
        return {};
    },
    components: { SearchAutocomplete }
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
	background-color: #a600ff;
	/* background-color: #C5050C; */
}
.search-bar {
	position: relative;
  	/* float: right; */
}
</style>