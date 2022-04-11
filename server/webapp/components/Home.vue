<template>
    <div>
        <div><LargeComputerOverview :info="this.info.average" :compHeight="14" :compWidth="30" /></div>
        <div class="container"><SmallComputerOverview v-for="x in this.info.individual" :info="x" :compHeight="7" :compWidth="15" /></div>
    </div>
</template>

<script>
import LargeComputerOverview from './LargeComputerOverview.vue'
import SmallComputerOverview from "./SmallComputerOverview.vue"
import lib from "../lib/lib.js"

export default{
    props:{
        info:{
			type:Object,
			default:{}
		},
    },
    data() {
        return {
            
        }
    },
    mounted() {
        
    },
    methods: {
        
    },
    computed:{
       
    },
    components:{
        LargeComputerOverview,
        SmallComputerOverview,
    },
}
</script>

<style>

.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}

</style>