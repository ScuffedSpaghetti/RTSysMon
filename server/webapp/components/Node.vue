<template>
    <div>
        <div><LargeComputerOverview :info="this.info" :compHeight="14" :compWidth="30" /></div>
        <p>
            
        </p>
    </div>
</template>

<script>

import LargeComputerOverview from './LargeComputerOverview.vue'
import lib from "../lib/lib.js"

export default {
    props:{

    },
    data() {
        return {
            info: {},
        }
    },
    mounted() {
        var messageHandler = (obj) => {
			if(obj.type == "info"){
                for(var x in obj.individual){
                    // console.log("id: " + this.id)
                    // console.log("host: " + obj.individual[x].hostname)
                    if(obj.individual[x].hostname == this.$route.params.id){
                        this.info = obj.individual[x]
                    }
                }
			}
		}
		
		lib.messageHandlers.push(messageHandler)
    },
    components:{
        LargeComputerOverview,
    },
    computed:{
        
    },
}
</script>
