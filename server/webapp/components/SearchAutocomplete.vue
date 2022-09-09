<template>
	<div>
		<input class="search-box" :style="{width:searchbarWidth+'px'}" v-model="search" @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp" @keydown.enter="onEnter" type="text"/>
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
			searchbarWidth: 200,
		}
	},
	mounted() {
		document.addEventListener('click', this.handleClickOutside)
		window.addEventListener('resize', this.searchWidth)
	},
	unmounted() {
    	window.removeEventListener('resize', this.searchWidth)
 	 },
	destroyed() {
		document.removeEventListener('click', this.handleClickOutside)
	},
	methods: {
		searchWidth(){
			//searchbar width
			var navWidth = this.$parent.$refs.nav.getBoundingClientRect().width
			var homeWidth = this.$parent.$refs.home.$el.getBoundingClientRect().width
			var settingsWidth = this.$parent.$refs.settings.$el.getBoundingClientRect().width
			var aboutWidth = 0
			if(this.$parent.$root.showAboutPage){
				aboutWidth = this.$parent.$refs.about.$el.getBoundingClientRect().width
			}
			var remainingWidth = navWidth - (homeWidth + settingsWidth + aboutWidth)
			const pad = 30
			const defaultSize = 200
			if(remainingWidth < (defaultSize + pad)){
				this.searchbarWidth = remainingWidth - pad
			}
			// console.log('showABoutPage: ' + this.$parent.$root.showAboutPage)
			// console.log('navWidth: ' + navWidth)
			// console.log('homeWidth: ' + homeWidth)
			// console.log('settingsWidth: ' + settingsWidth)
			// console.log('aboutWidth: ' + aboutWidth)
			// console.log('remainingWidth: ' + remainingWidth)
			// console.log('searchbarWidth: ' + this.searchbarWidth)
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
	
	.search-box {
		height: 1.5em;
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