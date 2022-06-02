<template>
  <div class="autocomplete">
    <input class="search-box" v-model="search" @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp" @keydown.enter="onEnter" type="text"/>
    <ul v-show="isOpen" class="autocomplete-results">
      <li  v-for="(result, i) in results" :key="i" @click="setResult(result)" class="autocomplete-result" :class="{ 'is-active': i === arrowCounter }">
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
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
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
  .autocomplete{
    position: relative;
  }

  .search-box {
    height: 1.5em;
    width: 15em
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
    padding: 4px 2px;
    cursor: pointer;
  }
  .autocomplete-result.is-active,
  .autocomplete-result:hover {
    background-color: #7171719e;
    color: #ffffff;
  }
</style>