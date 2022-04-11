<template>
    <div>
        <div><LargeComputerOverview :info="individualData" :compHeight="8" :compWidth="16" :compTitle="individualData.hostname"/></div>
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
			default:()=>{}
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
                // console.log("id: " + this.$route.params.id)
                // console.log("host: " + this.info.individual[x].uid)
                if(this.info.individual[x].uid == this.$route.params.id){
                    return this.info.individual[x]
                }
            }
            return {}
        }
    },
}
</script>
