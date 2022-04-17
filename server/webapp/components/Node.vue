<template>
    <div>
        <div class="pad">
            <LargeComputerOverview :info="individualData" :compHeight="8" :compWidth="16" :compTitle="individualData.hostname"/>
        </div>
        <div class="pad" v-if="individualData.cpu">
            <CpuDetails :info="individualData.cpu" :compHeight="4" :compWidth="4"/>
        </div>
        <div class="pad" v-if="individualData.gpu">
            <GpuDetails :info="individualData.gpu" :compHeight="5" :compWidth="10"/>
        </div>
        <div class="pad" v-if="individualData.network">
            <NetworkDetails :info="individualData.network" :compHeight="4" :compWidth="9"/>
        </div>
    </div>
</template>

<script>

import LargeComputerOverview from './LargeComputerOverview.vue'
import CpuDetails from './CpuDetails.vue'
import GpuDetails from './GpuDetails.vue'
import NetworkDetails from './NetworkDetails.vue'

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
        CpuDetails,
        GpuDetails,
        NetworkDetails,
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
            return this.info.average || {}
        }
    },
}
</script>

<style scoped>

.pad{
    margin:1em;
}
</style>
