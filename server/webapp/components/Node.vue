<template>
    <div>
        <div><LargeComputerOverview :info="individualData" :compHeight="14" :compWidth="30" :compTitle="individualData.hostname"/></div>
        <p>
            
        </p>
    </div>
</template>

<script>

import LargeComputerOverview from './LargeComputerOverview.vue'
import lib from "../lib/lib.js"

export default {
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
    components:{
        LargeComputerOverview,
    },
    computed:{
        individualData(){
            for(var x in this.info.individual){
                // console.log("id: " + this.id)
                // console.log("host: " + obj.individual[x].hostname)
                if(this.info.individual[x].hostname == this.$route.params.id){
                    return this.info.individual[x]
                } else {
                    return {}
                }
            }
        }
    },
}
</script>
