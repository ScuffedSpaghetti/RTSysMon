<template>

	<div class="top-nav" ref="nav">
		<div class="menu">
			<input id="hamburger-toggle" type="checkbox" />
			<label class="hamburger-menu" @click="hamburgerMenuClick()" for="hamburger-toggle">
				<div class="top"></div>
				<div class="meat"></div>
				<div class="bottom"></div>
			</label>
			<div class="menu-buttons">
				<router-link ref="home" class="active" :to="'/'">Home</router-link>
				<router-link ref="settings" :to="'/settings'">Settings</router-link>
				<router-link ref="about" v-if="this.$root.showAboutPage" :to="'/about'">About</router-link>
			</div>
		</div>
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
	mounted() {
		document.addEventListener('click', this.handleClickOutside)
		window.matchMedia('(min-width: 35rem)').addEventListener('change', this.windowResizeMenuReset)
	},
	destroyed() {
		document.removeEventListener('click', this.handleClickOutside)
		window.matchMedia('(min-width: 35rem)').removeEventListener('change', this.windowResizeMenuReset)
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
	methods: {
		hamburgerMenuClick(){
			var menuButtons = document.getElementsByClassName("menu-buttons").item(0)
			if(menuButtons.style.display == "none" || menuButtons.style.display == ""){
				menuButtons.style.display = "grid"
			} else {
				menuButtons.style.display = ""
			}
		},
		windowResizeMenuReset(){
			var menuButtons = document.getElementsByClassName("menu-buttons").item(0)
			var menuCheckbox = document.getElementById("hamburger-toggle")
			var largeWindow = window.matchMedia('(min-width: 35rem)').matches
			// console.log('checkbox: ' + menuCheckbox.checked)
			if(largeWindow && menuCheckbox.checked){
				menuButtons.style.display = ""
				menuCheckbox.checked = false
			}
		},
		handleClickOutside(event) {
			var menuButtons = document.getElementsByClassName("menu-buttons").item(0)
			var menuCheckbox = document.getElementById("hamburger-toggle")
			if (!document.getElementsByClassName("menu").item(0).contains(event.target)) {
				menuButtons.style.display = ""
				menuCheckbox.checked = false
			}
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
@media (min-width: 35rem) {
	.menu-buttons {
		display: inline-block;
 	}
	.hamburger-menu {
		visibility: hidden;
		position: absolute;
		left: -999999px;
	}
}
@media (max-width: 35rem) {
	.menu-buttons {
		display: none;
	}
	.hamburger-menu {
		float: left;
		visibility: visible;
		left: 0px;
	}
}
.hamburger-menu {
	font-size: 1em;
	width: 2.6em;
	height: 2.2em;
	margin: 0.35em;

	display: -ms-grid;
	display: grid;
	grid-template-rows: repeat(3, 1fr);
}
.hamburger-menu div {
	margin: 0.2em;
	position: relative;
	-webkit-transition: all 0.2s ease-in-out;
	transition: all 0.2s ease-in-out;
}
#hamburger-toggle {
  	display: none;
	font-size: 1em;
}

#hamburger-toggle:checked + .hamburger-menu .top {
	transform: rotateZ(45deg) scaleX(1.09) translate(0.5em, 0.5em);
  	-webkit-transform: rotateZ(45deg) scaleX(1.09) translate(0.5em, 0.5em);
}

#hamburger-toggle:checked + .hamburger-menu .meat {
	-webkit-transform: scale(0);
		transform: scale(0);
}

#hamburger-toggle:checked + .hamburger-menu .bottom {
	transform: rotateZ(-45deg) scaleX(1.09) translate(0.5em, -0.5em);
  	-webkit-transform: rotateZ(-45deg) scaleX(1.09) translate(0.5em, -0.5em);
}

.menu {
	display: grid;
	position: absolute;
	z-index: 1;
}

.menu-buttons {
	float: left;
}
.top-nav {
	height: 2.9em;
}
.top-nav a {
	float: left;
	text-align: center;
	padding: 0.8em 1em;
	text-decoration: none;
	font-size: 1em;
}
</style>