<template>
	<div>
		<img class="close-icon" src="../public/images/closeIcon.svg" alt="Close Icon"/>
		<img class="search-icon" src="../public/images/searchIcon/searchIcon_500px.svg" @click="searchIconClick()" alt="Search Icon"/>
		<input class="search-box" placeholder="Search" v-model="search" @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp" @keydown.enter="onEnter" type="text"/>
		<ul v-show="isOpen" class="autocomplete-results">
			<li v-for="(result, i) in results" :key="i" @click="setResult(result)" class="autocomplete-result" :class="{ 'is-active': i === arrowCounter }">
				{{ result }}
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'SearchAutocomplete',
	props: {
		items: {
			type: Array,
			required: true,
			default: () => [],
		},
	},
	data() {
		return {
			search: '',
			results: [],
			isOpen: false,
			arrowCounter: -1,
		}
	},
	mounted() {
		document.addEventListener('click', this.handleClickOutside)
		window.matchMedia('(min-width: 35rem)').addEventListener('change', this.windowResizeSearchReset)
	},
	destroyed() {
		document.removeEventListener('click', this.handleClickOutside)
		window.matchMedia('(min-width: 35rem)').removeEventListener('change', this.windowResizeSearchReset)
	},
	methods: {
		searchIconClick() {
			var searchBox = document.getElementsByClassName("search-box").item(0)
			var searchIcon = document.getElementsByClassName("search-icon").item(0)
			if(searchBox.style.display == "none" || searchBox.style.display == ""){
				searchBox.style.display = "inline-block"
				searchIcon.src = "img/closeIcon.svg"
			} else {
				searchBox.style.display = ""
				searchIcon.src = "img/searchIcon_500px.svg"
			}
		},
		windowResizeSearchReset(){
			var searchBox = document.getElementsByClassName("search-box").item(0)
			var searchIcon = document.getElementsByClassName("search-icon").item(0)
			var largeWindow = window.matchMedia('(min-width: 35rem)').matches
			// console.log('searchIcon: ' + searchIcon.getAttribute('src'))
			if(largeWindow && searchIcon.getAttribute('src') == "img/closeIcon.svg"){
				searchBox.style.display = ""
				searchIcon.src = "img/searchIcon_500px.svg"
			}
		},
		filterResults() {
			this.results = this.items.filter(item => item.toLowerCase().indexOf(this.search.toLowerCase()) > -1)
		},
		onChange() {
			this.filterResults()
			this.isOpen = true
		},
		setResult(result) {
			this.search = result
			this.navigate()
			this.isOpen = false
		},
		handleClickOutside(event) {
			if (!this.$el.contains(event.target)) {
				this.arrowCounter = -1
				this.isOpen = false
			}
		},
		onArrowDown() {
			if (this.arrowCounter < this.results.length) {
				this.arrowCounter = this.arrowCounter + 1
			}
		},
		onArrowUp() {
			if (this.arrowCounter > 0) {
				this.arrowCounter = this.arrowCounter - 1
			}
		},
		onEnter() {
			if(this.arrowCounter != -1){
				this.search = this.results[this.arrowCounter]
			}
			this.navigate()
			this.arrowCounter = -1
			this.isOpen = false
		},
		navigate(){
			//console.log("/node/" + this.search)
			this.$router.push("/node/" + this.search).catch(err => {})
		},
	},
}
</script>

<style scoped>
	.close-icon {
		visibility: hidden;
		position: absolute;
		left: -999999px;
	}
	.search-box {
		font-size: 1em;
		height: 1.4em;
	}
	.search-box::placeholder {
		background: url('../public/images/searchIcon/searchIcon_500px.svg') right / contain no-repeat;
	}
	.search-icon {
		width: 2em;
		height: 2em;
	}
	@media (min-width: 35rem) {
		.search-box {
			display: inline-block;
		}
		.search-icon {
			visibility: hidden;
			position: absolute;
			left: -999999px;
		}
	}
	/*The search-icon does weird positioning at 560px but is fine +- 0.1px */
	@media (max-width: 35rem) {
		.search-box {
			display: none;
		}
		.search-icon {
			float: right;
			visibility: visible;
			left: 0px
		}
	}
	.autocomplete-results {
		padding: 0;
		margin: 0;
		/* height: 120px;? */
		min-height: 1em;
		max-height: 6.5em;
		overflow: auto;
	}

	.autocomplete-result {
		list-style: none;
		text-align: left;
		padding: 0.2em 0.1em;
		cursor: pointer;
	}
	.autocomplete-result.is-active,
	.autocomplete-result:hover {
		background-color: #7171719e;
		color: #ffffff;
	}
</style>