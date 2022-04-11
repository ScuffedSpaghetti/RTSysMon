<template>
    <div>
        <div>
            <LargeComputerOverview :info="this.info.average" :compTitle="'Whole System Network Overview'"/>
        </div>
        <div class="container">
            <SmallComputerOverview v-for="x in this.info.individual" :key="x.uid" :info="x" :compHeight="5" :compWidth="8" :compTitle="x.hostname"/>
        </div>
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
			default:()=>{}
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

<style scoped>

.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}

</style>