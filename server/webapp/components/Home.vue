<template>
    <div>
        <div><LargeComputerOverview :info="averageData" :compHeight="14" :compWidth="30" /></div>
    </div>
</template>

<script>
import LargeComputerOverview from './LargeComputerOverview.vue'
import lib from "../lib/lib.js"

export default{
    props:{
        
    },
    data() {
        return {
            averageData:{},
        }
    },
    mounted() {
        var messageHandler = (obj) => {
			if(obj.type == "info"){
				this.averageData = obj.average
			}
		}
		
		lib.messageHandlers.push(messageHandler)
        
    },
    methods: {
        
    },
    computed:{
       
    },
    components:{
        LargeComputerOverview,
    },
}
</script>