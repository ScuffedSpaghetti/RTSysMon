<template>
    <div>
        <div><LargeComputerOverview :info="this.info" :compHeight="14" :compWidth="30" /></div>
        <p>
            {{id =$route.params.id}}
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
            id: "",
            info: {},
        }
    },
    mounted() {
        var messageHandler = (obj) => {
			if(obj.type == "info"){
                for(var x in obj.individual){
                    // console.log("id: " + this.id)
                    // console.log("host: " + obj.individual[x].hostname)
                    if(obj.individual[x].hostname == this.id){
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
        nodeData(){
            var data = this.info
			var out = {}
			for(var x in data){
				var item = data[x]
				out[x] = item.average
			}
			//console.log(out)
			return out
        },
    },
}
</script>
